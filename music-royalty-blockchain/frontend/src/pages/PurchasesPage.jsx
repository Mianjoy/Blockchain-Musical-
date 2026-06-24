import { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import './PurchasesPage.css';

export const PurchasesPage = () => {
  const { getUserPurchases } = useData();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [purchases, setPurchases] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    if (user) {
      const userPurchases = getUserPurchases(user.id);
      setPurchases(userPurchases);
      
      const total = userPurchases.reduce((sum, p) => sum + p.price, 0);
      setTotalSpent(total);
    }
  }, [user, getUserPurchases]);

  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
  };

  if (purchases.length === 0) {
    return (
      <div className="purchases-page">
        <h2>{t('myPurchases')}</h2>
        <div className="no-purchases">
          <p>{t('noPurchases')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="purchases-page">
      <h2>{t('myPurchases')}</h2>
      
      <div className="total-spent">
        <span>{t('totalSpent')}:</span>
        <strong>${totalSpent.toFixed(2)}</strong>
      </div>

      <div className="purchases-list">
        {purchases.map(purchase => (
          <div key={purchase.id} className="purchase-card">
            <div className="purchase-header">
              <div className="purchase-info">
                <h3>{purchase.songTitle}</h3>
                <p className="purchase-artist">{purchase.songArtist}</p>
              </div>
              <div className="purchase-price">
                ${purchase.price.toFixed(2)}
              </div>
            </div>

            <div className="purchase-details">
              <div className="purchase-date">
                <span>{t('purchaseDate')}:</span>
                <span>{new Date(purchase.purchaseDate).toLocaleDateString()}</span>
              </div>

              <div className="access-key-container">
                <label>{t('accessKey')}:</label>
                <div className="key-row">
                  <code>{purchase.accessKey}</code>
                  <button 
                    onClick={() => copyKey(purchase.accessKey)} 
                    className="btn-copy-small"
                  >
                    {t('copyKey')}
                  </button>
                </div>
              </div>

              <a 
                href={purchase.downloadLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-download-small"
              >
                {t('downloadNow')}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
