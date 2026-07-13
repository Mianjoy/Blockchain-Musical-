import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import apiService from '../services/api';

const NotificationContext = createContext(null);

function showBrowserPush(notification) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const n = new Notification(notification.titulo, {
      body: notification.mensaje,
      tag: notification.id,
      icon: '/vite.svg'
    });
    setTimeout(() => n.close(), 8000);
  } catch (_) {
    /* ignore */
  }
}

export function NotificationProvider({ children }) {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const seenIds = useRef(new Set());
  const firstLoad = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const data = await apiService.getNotificaciones();
      const list = data?.datos || [];
      setItems(list);
      setUnread(data?.noLeidas || 0);

      if (!firstLoad.current) {
        for (const n of list) {
          if (!seenIds.current.has(n.id) && !n.leida && n.tipo === 'lanzamiento') {
            showBrowserPush(n);
          }
        }
      }

      seenIds.current = new Set(list.map((n) => n.id));
      firstLoad.current = false;
    } catch (_) {
      /* API aún no disponible */
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 8000);
    return () => clearInterval(timer);
  }, [refresh]);

  const enablePush = async () => {
    if (!('Notification' in window)) return false;
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    setPushEnabled(granted);
    return granted;
  };

  const markRead = async (id) => {
    await apiService.marcarNotificacionLeida(id);
    await refresh();
  };

  const markAllRead = async () => {
    await apiService.marcarTodasNotificaciones();
    await refresh();
  };

  return (
    <NotificationContext.Provider
      value={{
        items,
        unread,
        panelOpen,
        setPanelOpen,
        pushEnabled,
        enablePush,
        markRead,
        markAllRead,
        refresh
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return ctx;
}
