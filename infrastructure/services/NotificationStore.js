const { v4: uuidv4 } = require('uuid');

/**
 * Almacén en memoria de notificaciones (nuevos lanzamientos, compras, etc.)
 */
class NotificationStore {
  constructor(maxItems = 100) {
    this._items = [];
    this._maxItems = maxItems;
    this._subscribers = new Set();
  }

  publicar({ tipo, titulo, mensaje, payload = {} }) {
    const notification = {
      id: uuidv4(),
      tipo: tipo || 'info',
      titulo,
      mensaje,
      payload,
      leida: false,
      fecha: new Date().toISOString()
    };

    this._items.unshift(notification);
    if (this._items.length > this._maxItems) {
      this._items = this._items.slice(0, this._maxItems);
    }

    for (const cb of this._subscribers) {
      try {
        cb(notification);
      } catch (_) {
        /* ignore subscriber errors */
      }
    }

    return notification;
  }

  listar({ soloNoLeidas = false } = {}) {
    if (soloNoLeidas) {
      return this._items.filter((n) => !n.leida);
    }
    return [...this._items];
  }

  marcarLeida(id) {
    const item = this._items.find((n) => n.id === id);
    if (item) {
      item.leida = true;
    }
    return item || null;
  }

  marcarTodasLeidas() {
    this._items.forEach((n) => {
      n.leida = true;
    });
    return this._items.length;
  }

  contarNoLeidas() {
    return this._items.filter((n) => !n.leida).length;
  }

  subscribe(callback) {
    this._subscribers.add(callback);
    return () => this._subscribers.delete(callback);
  }
}

module.exports = new NotificationStore();
