'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { validateNickname } = require('../../domain/utils/nickname');

/**
 * Persistencia simple de usuarios (nickname @ + password hash + recovery).
 * Archivo: data/users.json
 *
 * recoveryCode: se muestra UNA vez al registrar; solo se guarda el hash.
 */
class UserAuthStore {
  constructor(filePath) {
    this.filePath =
      filePath || path.join(__dirname, '../../data/users.json');
    this._users = new Map();
    this._load();
  }

  _load() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      if (!fs.existsSync(this.filePath)) {
        fs.writeFileSync(this.filePath, JSON.stringify({ users: [] }, null, 2));
        return;
      }
      const raw = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      const list = Array.isArray(raw.users) ? raw.users : [];
      this._users.clear();
      for (const u of list) {
        if (u && u.nickname) {
          this._users.set(String(u.nickname).toLowerCase(), u);
        }
      }
    } catch (err) {
      console.warn('[UserAuthStore] No se pudo cargar users.json:', err.message);
      this._users = new Map();
    }
  }

  _save() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const users = Array.from(this._users.values());
    fs.writeFileSync(this.filePath, JSON.stringify({ users }, null, 2));
  }

  _hashPassword(password, salt) {
    return new Promise((resolve, reject) => {
      crypto.scrypt(password, salt, 64, (err, derived) => {
        if (err) reject(err);
        else resolve(derived.toString('hex'));
      });
    });
  }

  _safeEqualHex(aHex, bHex) {
    const a = Buffer.from(String(aHex || ''), 'hex');
    const b = Buffer.from(String(bHex || ''), 'hex');
    if (a.length === 0 || b.length === 0 || a.length !== b.length) {
      return false;
    }
    return crypto.timingSafeEqual(a, b);
  }

  /**
   * Código legible tipo MR-XXXX-XXXX-XXXX-XXXX (aleatorio).
   */
  _generateRecoveryCode() {
    const raw = crypto.randomBytes(8).toString('hex').toUpperCase();
    const parts = raw.match(/.{1,4}/g) || [raw];
    return `MR-${parts.join('-')}`;
  }

  _normalizeRecoveryCode(code) {
    return String(code || '')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '');
  }

  exists(nickname) {
    const v = validateNickname(nickname);
    if (!v.ok) return false;
    return this._users.has(v.nickname);
  }

  async register(nicknameRaw, password) {
    const v = validateNickname(nicknameRaw);
    if (!v.ok) throw new Error(v.error);

    if (!password || String(password).length < 4) {
      throw new Error('La contraseña debe tener al menos 4 caracteres');
    }

    if (this._users.has(v.nickname)) {
      throw new Error(`El nickname ${v.nickname} ya está registrado`);
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = await this._hashPassword(String(password), salt);

    const recoveryCode = this._generateRecoveryCode();
    const recoverySalt = crypto.randomBytes(16).toString('hex');
    const recoveryHash = await this._hashPassword(
      this._normalizeRecoveryCode(recoveryCode),
      recoverySalt
    );

    const user = {
      nickname: v.nickname,
      salt,
      hash,
      recoverySalt,
      recoveryHash,
      createdAt: new Date().toISOString()
    };
    this._users.set(v.nickname, user);
    this._save();

    return {
      nickname: v.nickname,
      recoveryCode
    };
  }

  async login(nicknameRaw, password) {
    const v = validateNickname(nicknameRaw);
    if (!v.ok) throw new Error(v.error);

    if (!password) {
      throw new Error('La contraseña es obligatoria');
    }

    const user = this._users.get(v.nickname);
    if (!user) {
      throw new Error('Nickname o contraseña incorrectos');
    }

    const hash = await this._hashPassword(String(password), user.salt);
    if (!this._safeEqualHex(hash, user.hash)) {
      throw new Error('Nickname o contraseña incorrectos');
    }

    return { nickname: user.nickname };
  }

  /**
   * Resetea la contraseña con nick + código de recuperación.
   * Rota el código y devuelve uno nuevo (mostrar una vez).
   */
  async resetPasswordWithRecovery(nicknameRaw, recoveryCodeRaw, newPassword) {
    const v = validateNickname(nicknameRaw);
    if (!v.ok) throw new Error(v.error);

    if (!newPassword || String(newPassword).length < 4) {
      throw new Error('La contraseña debe tener al menos 4 caracteres');
    }

    const code = this._normalizeRecoveryCode(recoveryCodeRaw);
    if (!code || code.length < 8) {
      throw new Error('Nickname o código de recuperación incorrectos');
    }

    const user = this._users.get(v.nickname);
    if (!user || !user.recoverySalt || !user.recoveryHash) {
      throw new Error('Nickname o código de recuperación incorrectos');
    }

    const providedHash = await this._hashPassword(code, user.recoverySalt);
    if (!this._safeEqualHex(providedHash, user.recoveryHash)) {
      throw new Error('Nickname o código de recuperación incorrectos');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = await this._hashPassword(String(newPassword), salt);

    const newRecoveryCode = this._generateRecoveryCode();
    const recoverySalt = crypto.randomBytes(16).toString('hex');
    const recoveryHash = await this._hashPassword(
      this._normalizeRecoveryCode(newRecoveryCode),
      recoverySalt
    );

    user.salt = salt;
    user.hash = hash;
    user.recoverySalt = recoverySalt;
    user.recoveryHash = recoveryHash;
    user.updatedAt = new Date().toISOString();
    this._users.set(v.nickname, user);
    this._save();

    return {
      nickname: user.nickname,
      recoveryCode: newRecoveryCode
    };
  }
}

module.exports = UserAuthStore;
