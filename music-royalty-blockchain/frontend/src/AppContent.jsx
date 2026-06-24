import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HomePage } from './pages/HomePage';
import { SongsPage } from './pages/SongsPage';
import { CreateSongPage } from './pages/CreateSongPage';
import { SongDetailPage } from './pages/SongDetailPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { MySongsPage } from './pages/MySongsPage';
import { useState } from 'react';

export const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  if (!isAuthenticated) {
    if (currentPage === 'register') {
      return <RegisterPage onSwitchToLogin={() => setCurrentPage('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setCurrentPage('register')} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'songs':
        return <SongsPage onNavigate={setCurrentPage} />;
      case 'create-song':
        return <CreateSongPage onNavigate={setCurrentPage} />;
      case 'song-detail':
        return <SongDetailPage onNavigate={setCurrentPage} />;
      case 'purchases':
        return <PurchasesPage />;
      case 'my-songs':
        return <MySongsPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return renderPage();
};
