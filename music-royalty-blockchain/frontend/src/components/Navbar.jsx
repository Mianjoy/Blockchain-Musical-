import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import './Navbar.css';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  if (!isAuthenticated) {
    return (
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>🎵 MusicRoyalty</h1>
        </div>
        <div className="navbar-actions">
          <select 
            value={i18n.language} 
            onChange={(e) => changeLanguage(e.target.value)}
            className="language-selector"
          >
            <option value="es">🇪🇸 ES</option>
            <option value="en">🇬🇧 EN</option>
          </select>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>🎵 MusicRoyalty</h1>
      </div>
      
      <div className="navbar-menu">
        <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }))}>
          {t('home')}
        </button>
        <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'songs' }))}>
          {t('songs')}
        </button>
        <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'create-song' }))}>
          {t('createSong')}
        </button>
        <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'purchases' }))}>
          {t('myPurchases')}
        </button>
        <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'my-songs' }))}>
          {t('mySongs')}
        </button>
      </div>

      <div className="navbar-actions">
        <select 
          value={i18n.language} 
          onChange={(e) => changeLanguage(e.target.value)}
          className="language-selector"
        >
          <option value="es">🇪🇸 ES</option>
          <option value="en">🇬🇧 EN</option>
        </select>
        
        <div className="user-info">
          <span>{user?.fullName}</span>
        </div>
        
        <button onClick={logout} className="btn-logout">
          {t('logout')}
        </button>
      </div>
    </nav>
  );
};
