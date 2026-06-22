import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/Home.css';

const HomePage = ({ setCurrentPage }) => {
  const { t } = useTranslation();

  return (
    <div className="home-page">
      <section className="hero">
        <h1>{t('home.welcome')}</h1>
        <p className="subtitle">{t('home.description')}</p>
        <button 
          className="cta-button"
          onClick={() => setCurrentPage('songs')}
        >
          {t('nav.songs')}
        </button>
      </section>

      <section className="features">
        <h2>{t('home.features.title')}</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3>{t('home.features.1')}</h3>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>{t('home.features.2')}</h3>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>{t('home.features.3')}</h3>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>{t('home.features.4')}</h3>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
