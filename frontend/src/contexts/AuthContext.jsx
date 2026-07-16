import React, { createContext, useContext, useMemo, useState } from 'react';
import apiService from '../services/api';

const SESSION_KEY = 'musicRoyaltySession';
const NICKNAME_REGEX = /^@[a-zA-Z0-9_]{3,30}$/;

const AuthContext = createContext(null);

export function normalizeNickname(raw) {
  if (raw == null) return '';
  let n = String(raw).trim();
  if (!n) return '';
  if (!n.startsWith('@')) n = `@${n}`;
  return n.toLowerCase();
}

export function isValidNickname(raw) {
  return NICKNAME_REGEX.test(normalizeNickname(raw));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed?.nickname && isValidNickname(parsed.nickname)) {
        return { nickname: normalizeNickname(parsed.nickname) };
      }
    } catch {
      /* ignore */
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  const persist = (next) => {
    if (next?.nickname) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ nickname: next.nickname }));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
    setUser(next);
  };

  const register = async (nicknameRaw, password) => {
    setLoading(true);
    try {
      const nickname = normalizeNickname(nicknameRaw);
      if (!isValidNickname(nickname)) {
        throw new Error(
          'El nickname debe ser @usuario (3-30 caracteres: letras, números o _)'
        );
      }
      if (!password || String(password).length < 4) {
        throw new Error('La contraseña debe tener al menos 4 caracteres');
      }
      const data = await apiService.register(nickname, password);
      return {
        nickname: data.nickname || nickname,
        recoveryCode: data.recoveryCode || null
      };
    } finally {
      setLoading(false);
    }
  };

  const establishSession = (nicknameRaw) => {
    const nickname = normalizeNickname(nicknameRaw);
    if (!isValidNickname(nickname)) {
      throw new Error(
        'El nickname debe ser @usuario (3-30 caracteres: letras, números o _)'
      );
    }
    persist({ nickname });
  };

  const recoverPassword = async (nicknameRaw, recoveryCode, newPassword) => {
    setLoading(true);
    try {
      const nickname = normalizeNickname(nicknameRaw);
      if (!isValidNickname(nickname)) {
        throw new Error(
          'El nickname debe ser @usuario (3-30 caracteres: letras, números o _)'
        );
      }
      if (!recoveryCode || String(recoveryCode).trim().length < 8) {
        throw new Error('El código de recuperación no es válido');
      }
      if (!newPassword || String(newPassword).length < 4) {
        throw new Error('La contraseña debe tener al menos 4 caracteres');
      }
      const data = await apiService.recoverPassword(
        nickname,
        recoveryCode,
        newPassword
      );
      return {
        nickname: data.nickname || nickname,
        recoveryCode: data.recoveryCode || null
      };
    } finally {
      setLoading(false);
    }
  };

  const login = async (nicknameRaw, password) => {
    setLoading(true);
    try {
      const nickname = normalizeNickname(nicknameRaw);
      if (!isValidNickname(nickname)) {
        throw new Error(
          'El nickname debe ser @usuario (3-30 caracteres: letras, números o _)'
        );
      }
      if (!password) {
        throw new Error('La contraseña es obligatoria');
      }
      const data = await apiService.login(nickname, password);
      const session = { nickname: data.nickname || nickname };
      persist(session);
      return session;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    persist(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user?.nickname,
      loading,
      register,
      recoverPassword,
      establishSession,
      login,
      logout,
      normalizeNickname,
      isValidNickname
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}

export default AuthContext;
