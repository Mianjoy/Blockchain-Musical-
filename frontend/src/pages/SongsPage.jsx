import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import apiService from '../services/api';
import '../styles/SongsPage.css';

const SongsPage = ({ setCurrentPage, setSelectedSong }) => {
  const { t } = useTranslation();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getCanciones();
      setSongs(data);
    } catch (err) {
      console.error('Error loading songs:', err);
      setError(err.message || t('common.error'));
      setSongs([]);
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

  if (error) {
    return (
      <div className="songs-page">
        <h1>{t('songs.list.title')}</h1>
        <p className="empty-message">{error}</p>
        <button className="create-button" onClick={loadSongs}>
          Retry
        </button>
      </div>
    );
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
