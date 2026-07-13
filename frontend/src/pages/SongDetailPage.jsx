import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiService from '../services/api';
import '../styles/SongDetailPage.css';

const SongDetailPage = ({ song, setCurrentPage }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [distribucion, setDistribucion] = useState([]);

  if (!song) {
    return (
      <div className="song-detail-page">
        <p>{t('common.error')}</p>
      </div>
    );
  }

  const handlePurchase = async () => {
    setLoading(true);
    setError('');
    try {
      const compra = await apiService.comprarCancion(
        song.id,
        `buyer_${Date.now()}`,
        song.price || 1
      );

      setDistribucion(compra?.datos?.distribucion || []);

      const claveResp = await apiService.obtenerClaveAcceso(song.id);
      const key =
        claveResp?.datos?.claveAcceso ||
        claveResp?.claveAcceso ||
        song.claveAcceso ||
        '';

      setAccessKey(key);
      setPurchaseSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(accessKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (song.url) {
      window.open(song.url, '_blank');
    }
  };

  return (
    <div className="song-detail-page">
      <button
        className="btn-back"
        onClick={() => setCurrentPage('songs')}
      >
        ← {t('song.detail.back')}
      </button>

      <div className="song-info">
        <h1>{song.title}</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="info-grid">
          <div className="info-item">
            <label>{t('song.detail.song.title')}</label>
            <span>{song.title}</span>
          </div>
          <div className="info-item">
            <label>{t('song.detail.artist')}</label>
            <span>{song.artist}</span>
          </div>
          <div className="info-item">
            <label>{t('song.detail.price')}</label>
            <span>${song.price}</span>
          </div>
          <div className="info-item">
            <label>{t('song.detail.blockchain.id')}</label>
            <span className="blockchain-id">{song.blockchainId}</span>
          </div>
        </div>

        <div className="participants-section">
          <h3>{t('song.detail.participants.title')}</h3>
          <table className="participants-table">
            <thead>
              <tr>
                <th>{t('song.detail.participant.name')}</th>
                <th>{t('song.detail.participant.role')}</th>
                <th>{t('song.detail.participant.percentage')}</th>
              </tr>
            </thead>
            <tbody>
              {(song.participants || []).map((participant, index) => (
                <tr key={index}>
                  <td>{participant.name}</td>
                  <td>{participant.role}</td>
                  <td>{participant.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!purchaseSuccess ? (
          <div className="purchase-section">
            <h3>{t('song.detail.purchase.title')}</h3>
            <p>{t('song.detail.purchase.description')}</p>
            <button
              className="btn-purchase"
              onClick={handlePurchase}
              disabled={loading}
            >
              {loading ? t('song.detail.purchase.processing') : t('song.detail.purchase.button')}
            </button>
          </div>
        ) : (
          <div className="purchase-success">
            <div className="success-icon">✅</div>
            <h3>{t('song.detail.purchase.success')}</h3>
            {distribucion.length > 0 && (
              <div className="participants-section">
                <h4>Regalías distribuidas</h4>
                <ul>
                  {distribucion.map((d, i) => (
                    <li key={i}>
                      {d.nombre || d.name} ({d.rol || d.role}): ${Number(d.monto).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="access-key-container">
              <label>{t('song.detail.purchase.access.key')}</label>
              <div className="access-key-display">
                <code>{accessKey}</code>
                <button
                  className="btn-copy"
                  onClick={handleCopyKey}
                  title={t('song.detail.purchase.copy.key')}
                >
                  {copied ? t('song.detail.purchase.copied') : '📋'}
                </button>
              </div>
            </div>
            <button
              className="btn-download"
              onClick={handleDownload}
            >
              ⬇️ {t('song.detail.purchase.download')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SongDetailPage;
