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

  if (!song) {
    return (
      <div className="song-detail-page">
        <p>{t('common.error')}</p>
      </div>
    );
  }

  const handlePurchase = async () => {
    setLoading(true);
    try {
      // Simular compra con ID de usuario genérico
      const compraData = await apiService.comprarCancion(song.id, 'user-123');
      
      // Generar clave de acceso simulada (en producción vendría de la blockchain)
      const generatedKey = `KEY-${song.blockchainId}-${Date.now().toString(36).toUpperCase()}`;
      setAccessKey(generatedKey);
      setPurchaseSuccess(true);
    } catch (error) {
      // En caso de error, generar clave de todas formas para demo
      const generatedKey = `KEY-${song.blockchainId}-${Date.now().toString(36).toUpperCase()}`;
      setAccessKey(generatedKey);
      setPurchaseSuccess(true);
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
    // En producción, esto validaría la clave con el backend
    window.open(song.url, '_blank');
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
              {song.participants.map((participant, index) => (
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
