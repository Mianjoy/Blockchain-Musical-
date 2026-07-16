import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SongsPage from './pages/SongsPage';
import CreateSongPage from './pages/CreateSongPage';
import SongDetailPage from './pages/SongDetailPage';
import PurchasesPage from './pages/PurchasesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LoginPage from './pages/LoginPage';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import './styles/App.css';

function AppShell() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedSong, setSelectedSong] = useState(null);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'songs':
        return <SongsPage setCurrentPage={setCurrentPage} setSelectedSong={setSelectedSong} />;
      case 'create':
        return <CreateSongPage setCurrentPage={setCurrentPage} />;
      case 'song-detail':
        return <SongDetailPage song={selectedSong} setCurrentPage={setCurrentPage} />;
      case 'purchases':
        return <PurchasesPage />;
      case 'analytics':
        return <AnalyticsPage />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="app">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppShell />
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
