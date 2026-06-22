import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import apiService from '../services/api';
import '../styles/PurchasesPage.css';

const PurchasesPage = () => {
  const { t } = useTranslation();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleKeys, setVisibleKeys] = useState({});

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      // Datos de ejemplo para demostración
      const mockPurchases = [
        {
          id: 'p1',
          songId: '1',
          songTitle: 'Summer Vibes',
          artist: 'John Doe',
          date: '2024-01-15',
          amount: 9.99,
          accessKey: 'KEY-0x1a2b3c4d5e6f-ABC123'
        },
        {
          id: 'p2',
          songId: '2',
          songTitle: 'Night Dreams',
          artist: 'Music Band',
          date: '2024-01-16',
          amount: 12.99,
          accessKey: 'KEY-0x7g8h9i0j1k2l-DEF456'
        }
      ];
      
      // Intentar cargar desde la API, si falla usar datos mock
      try {
        const data = await apiService.getComprasByUsuario('user-123');
        setPurchases(data);
      } catch (error) {
        setPurchases(mockPurchases);
      }
    } catch (error) {
      console.error('Error loading purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleKeyVisibility = (purchaseId) => {
    setVisibleKeys(prev => ({
      ...prev,
      [purchaseId]: !prev[purchaseId]
    }));
  };

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    alert(t('song.detail.purchase.copied'));
  };

  const handleDownload = (purchase) => {
    // En producción, esto validaría la clave con el backend
    window.open(`https://example.com/download/${purchase.songId}?key=${purchase.accessKey}`, '_blank');
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (!purchases || purchases.length === 0) {
    return (
      <div className="purchases-page">
        <h1>{t('purchases.title')}</h1>
        <p className="empty-message">{t('purchases.empty')}</p>
      </div>
    );
  }

  return (
    <div className="purchases-page">
      <h1>{t('purchases.title')}</h1>
      
      <div className="purchases-list">
        {purchases.map((purchase) => (
          <div key={purchase.id} className="purchase-card">
            <div className="purchase-header">
              <div className="song-icon">🎵</div>
              <div className="purchase-info">
                <h3>{purchase.songTitle}</h3>
                <p className="artist">{purchase.artist}</p>
              </div>
            </div>

            <div className="purchase-details">
              <div className="detail-item">
                <label>{t('purchases.date')}</label>
                <span>{purchase.date}</span>
              </div>
              <div className="detail-item">
                <label>{t('purchases.amount')}</label>
                <span>${purchase.amount}</span>
              </div>
            </div>

            <div className="access-key-section">
              <label>{t('purchases.access.key')}</label>
              <div className="access-key-display">
                <code>
                  {visibleKeys[purchase.id] 
                    ? purchase.accessKey 
                    : '••••••••••••••••'}
                </code>
                <button
                  className="btn-toggle-key"
                  onClick={() => toggleKeyVisibility(purchase.id)}
                >
                  {visibleKeys[purchase.id] ? '🙈' : '👁️'}
                </button>
                <button
                  className="btn-copy-small"
                  onClick={() => handleCopyKey(purchase.accessKey)}
                  title={t('song.detail.purchase.copy.key')}
                >
                  📋
                </button>
              </div>
            </div>

            <button
              className="btn-download-purchase"
              onClick={() => handleDownload(purchase)}
            >
              ⬇️ {t('purchases.download')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PurchasesPage;
