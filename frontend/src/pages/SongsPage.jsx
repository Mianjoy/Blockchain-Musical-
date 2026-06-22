import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import apiService from '../services/api';
import '../styles/SongsPage.css';

const SongsPage = ({ setCurrentPage, setSelectedSong }) => {
  const { t } = useTranslation();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      // Datos de ejemplo para demostración
      const mockSongs = [
        {
          id: '1',
          blockchainId: '0x1a2b3c4d5e6f',
          title: 'Summer Vibes',
          artist: 'John Doe',
          url: 'https://example.com/summer-vibes.mp3',
          price: 9.99,
          participants: [
            { name: 'John Doe', role: 'Artista', percentage: 60 },
            { name: 'Jane Smith', role: 'Compositor', percentage: 40 }
          ]
        },
        {
          id: '2',
          blockchainId: '0x7g8h9i0j1k2l',
          title: 'Night Dreams',
          artist: 'Music Band',
          url: 'https://example.com/night-dreams.mp3',
          price: 12.99,
          participants: [
            { name: 'Mike Johnson', role: 'Cantante', percentage: 50 },
            { name: 'Sarah Wilson', role: 'Productor', percentage: 30 },
            { name: 'Tom Brown', role: 'Compositor', percentage: 20 }
          ]
        }
      ];
      
      // Intentar cargar desde la API, si falla usar datos mock
      try {
        const data = await apiService.getCanciones();
        setSongs(data);
      } catch (error) {
        setSongs(mockSongs);
      }
    } catch (error) {
      console.error('Error loading songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (song) => {
    setSelectedSong(song);
    setCurrentPage('song-detail');
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (!songs || songs.length === 0) {
    return (
      <div className="songs-page">
        <h1>{t('songs.list.title')}</h1>
        <p className="empty-message">{t('songs.list.empty')}</p>
        <button 
          className="create-button"
          onClick={() => setCurrentPage('create')}
        >
          {t('nav.create')}
        </button>
      </div>
    );
  }

  return (
    <div className="songs-page">
      <h1>{t('songs.list.title')}</h1>
      <div className="songs-grid">
        {songs.map((song) => (
          <div key={song.id} className="song-card">
            <div className="song-icon">🎵</div>
            <h3>{song.title}</h3>
            <p className="artist">{t('songs.list.card.artist')}: {song.artist}</p>
            <p className="price">{t('songs.list.card.price')}: ${song.price}</p>
            <div className="card-actions">
              <button 
                className="btn-details"
                onClick={() => handleViewDetails(song)}
              >
                {t('songs.list.card.details')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongsPage;
