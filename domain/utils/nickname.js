'use strict';

const NICKNAME_REGEX = /^@[a-zA-Z0-9_]{3,30}$/;

/**
 * Normaliza y valida nicknames tipo @usuario
 * @param {string} raw
 * @returns {string} nickname normalizado (lowercase)
 */
function normalizeNickname(raw) {
  if (raw == null) return '';
  let n = String(raw).trim();
  if (!n) return '';
  if (!n.startsWith('@')) n = `@${n}`;
  return n.toLowerCase();
}

/**
 * @param {string} raw
 * @returns {{ ok: true, nickname: string } | { ok: false, error: string }}
 */
function validateNickname(raw) {
  const nickname = normalizeNickname(raw);
  if (!nickname) {
    return { ok: false, error: 'El nickname es obligatorio' };
  }
  if (!NICKNAME_REGEX.test(nickname)) {
    return {
      ok: false,
      error:
        'El nickname debe ser @usuario (3-30 caracteres: letras, números o _). Ejemplo: @artista1'
    };
  }
  return { ok: true, nickname };
}

module.exports = {
  NICKNAME_REGEX,
  normalizeNickname,
  validateNickname
};
