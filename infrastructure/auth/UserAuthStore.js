'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { validateNickname } = require('../../domain/utils/nickname');

/**
 * Persistencia simple de usuarios (nickname @ + password hash).
 * Archivo: data/users.json
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
    const user = {
      nickname: v.nickname,
      salt,
      hash,
      createdAt: new Date().toISOString()
    };
    this._users.set(v.nickname, user);
    this._save();
    return { nickname: v.nickname };
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
    const a = Buffer.from(hash, 'hex');
    const b = Buffer.from(user.hash, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      throw new Error('Nickname o contraseña incorrectos');
    }

    return { nickname: user.nickname };
  }
}

module.exports = UserAuthStore;
