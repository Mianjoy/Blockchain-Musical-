import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, normalizeNickname } from '../contexts/AuthContext';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const { login, register, recoverPassword, establishSession, loading } = useAuth();
  const [mode, setMode] = useState('login');
  const [nickname, setNickname] = useState('@');
  const [password, setPassword] = useState('');
  const [recoveryInput, setRecoveryInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shownRecoveryCode, setShownRecoveryCode] = useState(null);
  const [pendingSessionNick, setPendingSessionNick] = useState(null);
  const [recoveryContext, setRecoveryContext] = useState('register');
  const [copied, setCopied] = useState(false);

  const onNicknameChange = (value) => {
    let v = value;
    if (!v.startsWith('@')) v = `@${v.replace(/^@+/, '')}`;
    setNickname(v);
  };

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setSuccess('');
    setPassword('');
    setRecoveryInput('');
    setNewPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const nick = normalizeNickname(nickname);
      if (mode === 'register') {
        const result = await register(nick, password);
        if (result?.recoveryCode) {
          setRecoveryContext('register');
          setShownRecoveryCode(result.recoveryCode);
          setPendingSessionNick(result.nickname || nick);
          setCopied(false);
        } else {
          establishSession(result.nickname || nick);
        }
      } else if (mode === 'recover') {
        const result = await recoverPassword(nick, recoveryInput, newPassword);
        setSuccess(t('auth.recover.success'));
        if (result?.recoveryCode) {
          setRecoveryContext('recover');
          setShownRecoveryCode(result.recoveryCode);
          setPendingSessionNick(null);
          setCopied(false);
        }
        setMode('login');
        setPassword('');
        setRecoveryInput('');
        setNewPassword('');
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

  const copyRecoveryCode = async () => {
    if (!shownRecoveryCode) return;
    try {
      await navigator.clipboard.writeText(shownRecoveryCode);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const dismissRecoveryModal = () => {
    const nick = pendingSessionNick;
    setShownRecoveryCode(null);
    setPendingSessionNick(null);
    setCopied(false);
    if (nick) {
      establishSession(nick);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <h1>Music Royalty</h1>
          <p>{t('auth.subtitle')}</p>
        </div>

        <div className="login-tabs login-tabs-3">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => switchMode('login')}
          >
            {t('auth.login')}
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => switchMode('register')}
          >
            {t('auth.register')}
          </button>
          <button
            type="button"
            className={mode === 'recover' ? 'active' : ''}
            onClick={() => switchMode('recover')}
          >
            {t('auth.recover')}
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}
        {success && !shownRecoveryCode && (
          <div className="login-success">{success}</div>
        )}

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

          {mode === 'recover' ? (
            <>
              <label htmlFor="recoveryCode">{t('auth.recoveryCode')}</label>
              <input
                id="recoveryCode"
                type="text"
                autoComplete="off"
                value={recoveryInput}
                onChange={(e) => setRecoveryInput(e.target.value.toUpperCase())}
                placeholder="MR-XXXX-XXXX-XXXX-XXXX"
                disabled={loading}
                spellCheck={false}
              />
              <p className="login-hint">{t('auth.recoveryCode.hint')}</p>

              <label htmlFor="newPassword">{t('auth.newPassword')}</label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
            </>
          ) : (
            <>
              <label htmlFor="password">{t('auth.password')}</label>
              <input
                id="password"
                type="password"
                autoComplete={
                  mode === 'register' ? 'new-password' : 'current-password'
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
            </>
          )}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading
              ? t('common.loading')
              : mode === 'register'
                ? t('auth.register.submit')
                : mode === 'recover'
                  ? t('auth.recover.submit')
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

      {shownRecoveryCode && (
        <div className="recovery-modal-backdrop" role="dialog" aria-modal="true">
          <div className="recovery-modal">
            <h2>
              {recoveryContext === 'recover'
                ? t('auth.recovery.modal.titleAfterReset')
                : t('auth.recovery.modal.title')}
            </h2>
            <p>{t('auth.recovery.modal.body')}</p>
            <code className="recovery-code">{shownRecoveryCode}</code>
            <div className="recovery-modal-actions">
              <button type="button" onClick={copyRecoveryCode}>
                {copied ? t('auth.recovery.copied') : t('auth.recovery.copy')}
              </button>
              <button
                type="button"
                className="recovery-modal-primary"
                onClick={dismissRecoveryModal}
              >
                {t('auth.recovery.saved')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
