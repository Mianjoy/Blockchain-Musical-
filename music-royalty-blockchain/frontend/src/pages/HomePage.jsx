import { useTranslation } from 'react-i18next';
import './HomePage.css';

export const HomePage = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <div className="home-page">
      <section className="hero">
        <h1>{t('welcomeTitle')}</h1>
        <p className="subtitle">{t('welcomeSubtitle')}</p>
        <button 
          className="btn-cta" 
          onClick={() => onNavigate('songs')}
        >
          {t('getStarted')}
        </button>
      </section>

      <section className="features">
        <h2>{t('features')}</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3>Blockchain</h3>
            <p>{t('feature1')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Regalías</h3>
            <p>{t('feature2')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Seguridad</h3>
            <p>{t('feature3')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Transparencia</h3>
            <p>{t('feature4')}</p>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stat-item">
          <h3>100+</h3>
          <p>Canciones Registradas</p>
        </div>
        <div className="stat-item">
          <h3>500+</h3>
          <p>Usuarios Activos</p>
        </div>
        <div className="stat-item">
          <h3>$10K+</h3>
          <p>Regalías Distribuidas</p>
        </div>
      </section>
    </div>
  );
};
