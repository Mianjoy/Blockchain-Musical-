import React from 'react';
import { useTranslation } from 'react-i18next';
import NotificationBell from './NotificationBell';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Navbar.css';

const Navbar = ({ currentPage, setCurrentPage }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Music Royalty</h1>
      </div>

      <div className="navbar-menu">
        <button
          className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => setCurrentPage('home')}
        >
          {t('nav.home')}
        </button>
        <button
          className={`nav-item ${currentPage === 'songs' ? 'active' : ''}`}
          onClick={() => setCurrentPage('songs')}
        >
          {t('nav.songs')}
        </button>
        <button
          className={`nav-item ${currentPage === 'create' ? 'active' : ''}`}
          onClick={() => setCurrentPage('create')}
        >
          {t('nav.create')}
        </button>
        <button
          className={`nav-item ${currentPage === 'analytics' ? 'active' : ''}`}
          onClick={() => setCurrentPage('analytics')}
        >
          {t('nav.analytics')}
        </button>
        <button
          className={`nav-item ${currentPage === 'purchases' ? 'active' : ''}`}
          onClick={() => setCurrentPage('purchases')}
        >
          {t('nav.purchases')}
        </button>
      </div>

      <div className="navbar-right">
        <NotificationBell />
        <span className="navbar-user" title={user?.nickname}>
          {user?.nickname}
        </span>
        <button type="button" className="nav-logout" onClick={logout}>
          {t('auth.logout')}
        </button>
        <div className="navbar-language">
          <select
            value={i18n.language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="language-selector"
          >
            <option value="es">{t('language.es')}</option>
            <option value="en">{t('language.en')}</option>
          </select>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
