import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import './Auth.css';

export const RegisterPage = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password.length < 6) {
      setError(t('minLength', { length: 6 }));
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const result = register(formData.fullName, formData.email, formData.password);
      
      if (result.success) {
        // Registro exitoso
      } else {
        setError(result.error);
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>{t('register')}</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">{t('fullName')}</label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Juan Pérez"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">{t('email')}</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('password')}</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t('loading') : t('register')}
            </button>
          </form>

          <p className="auth-switch">
            {t('hasAccount')}{' '}
            <button onClick={onSwitchToLogin} className="btn-link">
              {t('login')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
