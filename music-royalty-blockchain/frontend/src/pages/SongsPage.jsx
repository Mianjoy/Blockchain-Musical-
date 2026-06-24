import { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import './SongsPage.css';

export const SongsPage = ({ onNavigate }) => {
  const { songs } = useData();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [filteredSongs, setFilteredSongs] = useState([]);

  const genres = ['pop', 'rock', 'jazz', 'classical', 'electronic', 'reggaeton', 'salsa', 'hip-hop', 'country', 'rnb', 'other'];

  useEffect(() => {
    let filtered = [...songs];

    if (searchTerm) {
      filtered = filtered.filter(song =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGenre !== 'all') {
      filtered = filtered.filter(song => song.genre === selectedGenre);
    }

    setFilteredSongs(filtered);
  }, [searchTerm, selectedGenre, songs]);

  const handleSongClick = (songId) => {
    window.dispatchEvent(new CustomEvent('navigate-to-detail', { detail: songId }));
  };

  return (
    <div className="songs-page">
      <div className="songs-header">
        <h2>{t('songs')}</h2>
        
        <div className="filters">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="genre-filter"
          >
            <option value="all">{t('allGenres')}</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>
                {t(`genre.${genre}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredSongs.length === 0 ? (
        <div className="no-results">
          <p>{t('noSongsFound')}</p>
        </div>
      ) : (
        <div className="songs-grid">
          {filteredSongs.map(song => (
            <div key={song.id} className="song-card" onClick={() => handleSongClick(song.id)}>
              <img src={song.coverUrl} alt={song.title} className="song-cover" />
              <div className="song-info">
                <h3>{song.title}</h3>
                <p className="artist">{song.artist}</p>
                <div className="song-meta">
                  <span className="genre-tag">{t(`genre.${song.genre}`)}</span>
                  <span className="price">${song.price.toFixed(2)}</span>
                </div>
              </div>
              <button className="btn-buy-preview">
                {t('details')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
