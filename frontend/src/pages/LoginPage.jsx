import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, normalizeNickname } from '../contexts/AuthContext';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const { login, register, loading } = useAuth();
  const [mode, setMode] = useState('login');
  const [nickname, setNickname] = useState('@');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onNicknameChange = (value) => {
    let v = value;
    if (!v.startsWith('@')) v = `@${v.replace(/^@+/, '')}`;
    setNickname(v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const nick = normalizeNickname(nickname);
      if (mode === 'register') {
        await register(nick, password);
      } else {
        await login(nick, password);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          t('auth.error.generic')
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <h1>Music Royalty</h1>
          <p>{t('auth.subtitle')}</p>
        </div>

        <div className="login-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => {
              setMode('login');
              setError('');
            }}
          >
            {t('auth.login')}
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => {
              setMode('register');
              setError('');
            }}
          >
            {t('auth.register')}
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="nickname">{t('auth.nickname')}</label>
          <input
            id="nickname"
            type="text"
            autoComplete="username"
            value={nickname}
            onChange={(e) => onNicknameChange(e.target.value)}
            onBlur={() => setNickname(normalizeNickname(nickname) || '@')}
            placeholder="@usuario"
            disabled={loading}
            spellCheck={false}
          />
          <p className="login-hint">{t('auth.nickname.hint')}</p>

          <label htmlFor="password">{t('auth.password')}</label>
          <input
            id="password"
            type="password"
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
          />

          <button type="submit" className="login-submit" disabled={loading}>
            {loading
              ? t('common.loading')
              : mode === 'register'
                ? t('auth.register.submit')
                : t('auth.login.submit')}
          </button>
        </form>

        <div className="login-lang">
          <select
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            aria-label={t('language.es')}
          >
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
