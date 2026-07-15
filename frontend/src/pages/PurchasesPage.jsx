import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/PurchasesPage.css';

const PurchasesPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleKeys, setVisibleKeys] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const loadPurchases = useCallback(async () => {
    if (!user?.nickname) {
      setPurchases([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await apiService.getComprasByUsuario(user.nickname);
      setPurchases(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading purchases:', err);
      setError(err.response?.data?.error || err.message || t('common.error'));
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }, [user?.nickname, t]);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  const toggleKeyVisibility = (purchaseId) => {
    setVisibleKeys((prev) => ({
      ...prev,
      [purchaseId]: !prev[purchaseId]
    }));
  };

  const handleCopyKey = (purchase) => {
    if (!purchase.accessKey) return;
    navigator.clipboard.writeText(purchase.accessKey);
    setCopiedId(purchase.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (purchase) => {
    if (purchase.url) {
      window.open(purchase.url, '_blank');
      return;
    }
    setError(t('purchases.download.missing'));
  };

  const formatDate = (value) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleString(i18n.language);
    } catch {
      return String(value);
    }
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  return (
    <div className="purchases-page">
      <div className="purchases-header-row">
        <h1>{t('purchases.title')}</h1>
        <button type="button" className="btn-refresh-purchases" onClick={loadPurchases}>
          {t('purchases.refresh')}
        </button>
      </div>

      {user?.nickname && (
        <p className="purchases-user">
          {t('purchases.forUser', { nick: user.nickname })}
        </p>
      )}

      {error && <div className="error-message">{error}</div>}

      {!purchases || purchases.length === 0 ? (
        <p className="empty-message">{t('purchases.empty')}</p>
      ) : (
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
                  <span>{formatDate(purchase.date)}</span>
                </div>
                <div className="detail-item">
                  <label>{t('purchases.amount')}</label>
                  <span>${Number(purchase.amount).toFixed(2)}</span>
                </div>
              </div>

              <div className="access-key-section">
                <label>{t('purchases.access.key')}</label>
                <div className="access-key-display">
                  <code>
                    {purchase.accessKey
                      ? visibleKeys[purchase.id]
                        ? purchase.accessKey
                        : '••••••••••••••••'
                      : t('purchases.access.missing')}
                  </code>
                  {purchase.accessKey && (
                    <>
                      <button
                        type="button"
                        className="btn-toggle-key"
                        onClick={() => toggleKeyVisibility(purchase.id)}
                      >
                        {visibleKeys[purchase.id] ? '🙈' : '👁️'}
                      </button>
                      <button
                        type="button"
                        className="btn-copy-small"
                        onClick={() => handleCopyKey(purchase)}
                        title={t('song.detail.purchase.copy.key')}
                      >
                        {copiedId === purchase.id ? '✓' : '📋'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="btn-download-purchase"
                onClick={() => handleDownload(purchase)}
                disabled={!purchase.url}
              >
                ⬇️ {t('purchases.download')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchasesPage;
