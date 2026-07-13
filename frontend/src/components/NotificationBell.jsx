import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../contexts/NotificationContext';
import '../styles/NotificationBell.css';

const NotificationBell = () => {
  const { t } = useTranslation();
  const {
    items,
    unread,
    panelOpen,
    setPanelOpen,
    pushEnabled,
    enablePush,
    markRead,
    markAllRead
  } = useNotifications();

  return (
    <div className="notif-wrap">
      <button
        type="button"
        className="notif-bell"
        aria-label={t('notifications.title')}
        onClick={() => setPanelOpen(!panelOpen)}
      >
        <span className="notif-bell-icon" aria-hidden>🔔</span>
        {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {panelOpen && (
        <div className="notif-panel">
          <div className="notif-panel-head">
            <h3>{t('notifications.title')}</h3>
            <div className="notif-panel-actions">
              {!pushEnabled && (
                <button type="button" className="notif-link" onClick={enablePush}>
                  {t('notifications.enablePush')}
                </button>
              )}
              {unread > 0 && (
                <button type="button" className="notif-link" onClick={markAllRead}>
                  {t('notifications.markAll')}
                </button>
              )}
            </div>
          </div>

          <div className="notif-list">
            {items.length === 0 ? (
              <p className="notif-empty">{t('notifications.empty')}</p>
            ) : (
              items.slice(0, 20).map((n) => (
                <button
                  type="button"
                  key={n.id}
                  className={`notif-item ${n.leida ? '' : 'unread'}`}
                  onClick={() => markRead(n.id)}
                >
                  <span className={`notif-type notif-type-${n.tipo}`}>
                    {n.tipo === 'lanzamiento' ? t('notifications.type.release') : t('notifications.type.sale')}
                  </span>
                  <strong>{n.titulo}</strong>
                  <p>{n.mensaje}</p>
                  <time>{new Date(n.fecha).toLocaleString()}</time>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
