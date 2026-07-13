import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiService from '../services/api';
import '../styles/SongsPage.css';

function initials(title = '', artist = '') {
  const a = (title.trim()[0] || 'M').toUpperCase();
  const b = (artist.trim()[0] || 'R').toUpperCase();
  return `${a}${b}`;
}

function coverTone(id = '') {
  const tones = ['tone-a', 'tone-b', 'tone-c', 'tone-d', 'tone-e'];
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i) * (i + 1)) % tones.length;
  return tones[hash];
}

const SongsPage = ({ setCurrentPage, setSelectedSong }) => {
  const { t } = useTranslation();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [artistFilter, setArtistFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [view, setView] = useState('list');

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

  const artists = useMemo(() => {
    const set = new Set(songs.map((s) => s.artist).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [songs]);

  const filtered = useMemo(() => {
    let list = [...songs];
    const q = query.trim().toLowerCase();

    if (q) {
      list = list.filter(
        (s) =>
          s.title?.toLowerCase().includes(q) ||
          s.artist?.toLowerCase().includes(q) ||
          s.id?.toLowerCase().includes(q)
      );
    }

    if (artistFilter !== 'all') {
      list = list.filter((s) => s.artist === artistFilter);
    }

    list.sort((a, b) => {
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'artist') return (a.artist || '').localeCompare(b.artist || '');
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      // recent
      return String(b.fechaCreacion || b.id).localeCompare(String(a.fechaCreacion || a.id));
    });

    return list;
  }, [songs, query, artistFilter, sortBy]);

  const handleViewDetails = (song) => {
    setSelectedSong(song);
    setCurrentPage('song-detail');
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  return (
    <div className="songs-page catalog-page">
      <header className="catalog-hero">
        <div>
          <p className="catalog-kicker">{t('songs.catalog.kicker')}</p>
          <h1>{t('songs.list.title')}</h1>
          <p className="catalog-lead">{t('songs.catalog.lead')}</p>
        </div>
        <button type="button" className="create-button" onClick={() => setCurrentPage('create')}>
          {t('nav.create')}
        </button>
      </header>

      <section className="catalog-toolbar" aria-label={t('songs.catalog.filters')}>
        <div className="catalog-search">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('songs.catalog.search')}
            aria-label={t('songs.catalog.search')}
          />
        </div>

        <select value={artistFilter} onChange={(e) => setArtistFilter(e.target.value)}>
          <option value="all">{t('songs.catalog.allArtists')}</option>
          {artists.map((artist) => (
            <option key={artist} value={artist}>
              {artist}
            </option>
          ))}
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="recent">{t('songs.catalog.sort.recent')}</option>
          <option value="title">{t('songs.catalog.sort.title')}</option>
          <option value="artist">{t('songs.catalog.sort.artist')}</option>
          <option value="price-asc">{t('songs.catalog.sort.priceAsc')}</option>
          <option value="price-desc">{t('songs.catalog.sort.priceDesc')}</option>
        </select>

        <div className="view-toggle" role="group" aria-label={t('songs.catalog.view')}>
          <button
            type="button"
            className={view === 'list' ? 'active' : ''}
            onClick={() => setView('list')}
          >
            {t('songs.catalog.viewList')}
          </button>
          <button
            type="button"
            className={view === 'grid' ? 'active' : ''}
            onClick={() => setView('grid')}
          >
            {t('songs.catalog.viewGrid')}
          </button>
        </div>
      </section>

      <div className="catalog-meta">
        <span>
          {filtered.length} {t('songs.catalog.available')}
        </span>
      </div>

      {error && <p className="empty-message">{error}</p>}

      {!error && filtered.length === 0 ? (
        <div className="catalog-empty">
          <p className="empty-message">{t('songs.list.empty')}</p>
          <button type="button" className="create-button" onClick={() => setCurrentPage('create')}>
            {t('nav.create')}
          </button>
        </div>
      ) : view === 'list' ? (
        <div className="catalog-list" role="list">
          {filtered.map((song, index) => (
            <article
              key={song.id}
              className="catalog-row"
              role="listitem"
              style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
            >
              <div className={`cover ${coverTone(song.id)}`} aria-hidden>
                <span>{initials(song.title, song.artist)}</span>
              </div>
              <div className="catalog-main">
                <h3>{song.title}</h3>
                <p>
                  {song.artist}
                  <span className="dot">·</span>
                  {(song.participants || []).length} {t('songs.catalog.rightsHolders')}
                </p>
              </div>
              <div className="catalog-id" title={song.blockchainId}>
                {String(song.blockchainId || '').slice(0, 18)}…
              </div>
              <div className="catalog-price">${Number(song.price || 0).toFixed(2)}</div>
              <div className="catalog-actions">
                <button type="button" className="btn-details" onClick={() => handleViewDetails(song)}>
                  {t('songs.list.card.details')}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="songs-grid">
          {filtered.map((song) => (
            <div key={song.id} className="song-card pro-card">
              <div className={`cover cover-lg ${coverTone(song.id)}`} aria-hidden>
                <span>{initials(song.title, song.artist)}</span>
              </div>
              <h3>{song.title}</h3>
              <p className="artist">
                {t('songs.list.card.artist')}: {song.artist}
              </p>
              <p className="price">
                {t('songs.list.card.price')}: ${Number(song.price || 0).toFixed(2)}
              </p>
              <div className="card-actions">
                <button type="button" className="btn-details" onClick={() => handleViewDetails(song)}>
                  {t('songs.list.card.details')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SongsPage;
