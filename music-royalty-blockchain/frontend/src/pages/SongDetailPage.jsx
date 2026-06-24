import { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import './SongDetailPage.css';

export const SongDetailPage = ({ onNavigate }) => {
  const { getSongById, purchaseSong, hasPurchased, loading } = useData();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [song, setSong] = useState(null);
  const [purchased, setPurchased] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const handleNavigate = (event) => {
      const songId = event.detail;
      const songData = getSongById(songId);
      setSong(songData);
      
      if (user && songData) {
        setPurchased(hasPurchased(user.id, songId));
      }
    };

    window.addEventListener('navigate-to-detail', handleNavigate);
    
    return () => {
      window.removeEventListener('navigate-to-detail', handleNavigate);
    };
  }, [getSongById, hasPurchased, user]);

  const handlePurchase = () => {
    if (!user || !song) return;
    
    const result = purchaseSong(song.id, user.id, user);
    setPurchaseResult(result);
    
    if (result.success) {
      setPurchased(true);
      setShowKey(true);
    }
  };

  const copyKey = () => {
    if (purchaseResult?.purchase?.accessKey) {
      navigator.clipboard.writeText(purchaseResult.purchase.accessKey);
    }
  };

  if (!song) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="song-detail-page">
      <button className="btn-back" onClick={() => onNavigate('songs')}>
        ← {t('back')}
      </button>

      <div className="song-detail-container">
        <div className="song-detail-header">
          <img src={song.coverUrl} alt={song.title} className="detail-cover" />
          
          <div className="detail-info">
            <h1>{song.title}</h1>
            <p className="detail-artist">{song.artist}</p>
            
            <div className="detail-meta">
              <span className="genre-badge">{t(`genre.${song.genre}`)}</span>
              <span className="price-large">${song.price.toFixed(2)}</span>
            </div>

            <p className="detail-description">{song.description}</p>

            {!purchased ? (
              <button 
                className="btn-purchase" 
                onClick={handlePurchase}
                disabled={loading}
              >
                {loading ? t('loading') : t('confirmPurchase')}
              </button>
            ) : (
              <div className="purchased-badge">
                ✓ {t('alreadyPurchased')}
              </div>
            )}

            {purchaseResult?.success && showKey && (
              <div className="access-key-section">
                <h3>{t('accessKey')}</h3>
                <div className="key-display">
                  <code>{purchaseResult.purchase.accessKey}</code>
                  <button onClick={copyKey} className="btn-copy">
                    {t('copyKey')}
                  </button>
                </div>
                <a 
                  href={song.downloadLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-download"
                >
                  {t('downloadNow')}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="participants-section-detail">
          <h2>{t('participants')}</h2>
          <h3>{t('royaltyDistribution')}</h3>
          
          <div className="participants-list">
            {song.participants.map((participant, index) => (
              <div key={index} className="participant-item">
                <div className="participant-info">
                  <strong>{participant.name}</strong>
                  <span className="participant-role">{t(`role.${participant.role}`)}</span>
                </div>
                <div className="participant-percentage">
                  {participant.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
