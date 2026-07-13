import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function mapCancionFromApi(c) {
  if (!c) return null;
  return {
    id: c.id,
    blockchainId: c.id,
    title: c.titulo || c.title,
    artist: c.artista || c.artist,
    url: c.linkArchivo || c.url,
    price: c.precio || c.price || 1,
    participants: (c.participantes || c.participants || []).map((p) => ({
      name: p.nombre || p.name,
      role: p.rol || p.role,
      percentage: p.porcentaje || p.percentage
    })),
    claveAcceso: c.claveAcceso,
    activa: c.activa !== false,
    fechaCreacion: c.fechaCreacion || null
  };
}

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getCanciones() {
    const response = await this.api.get('/canciones');
    const list = response.data?.datos || response.data || [];
    return Array.isArray(list) ? list.map(mapCancionFromApi) : [];
  }

  async getCancionById(id) {
    const response = await this.api.get(`/canciones/${id}`);
    return mapCancionFromApi(response.data?.datos || response.data);
  }

  async crearCancion(cancionData) {
    const payload = {
      titulo: cancionData.title || cancionData.titulo,
      artista: cancionData.artist || cancionData.artista,
      linkArchivo: cancionData.url || cancionData.linkArchivo,
      participantes: (cancionData.participants || cancionData.participantes || []).map((p) => ({
        nombre: p.name || p.nombre,
        rol: p.role || p.rol,
        porcentaje: Number(p.percentage ?? p.porcentaje)
      })),
      usuarioId: cancionData.usuarioId || 'artista_local'
    };

    const response = await this.api.post('/canciones', payload);
    return response.data;
  }

  async comprarCancion(cancionId, compradorId, monto = 1) {
    const response = await this.api.post('/compras', {
      cancionId,
      compradorId,
      monto: Number(monto)
    });
    return response.data;
  }

  async obtenerClaveAcceso(cancionId) {
    const response = await this.api.get(`/descargar/${cancionId}`);
    return response.data;
  }

  async getAnalytics() {
    const response = await this.api.get('/analytics/regalias');
    return response.data?.datos || response.data;
  }

  async getNotificaciones(soloNoLeidas = false) {
    const response = await this.api.get('/notificaciones', {
      params: soloNoLeidas ? { unread: 'true' } : undefined
    });
    return response.data;
  }

  async marcarNotificacionLeida(id) {
    const response = await this.api.post(`/notificaciones/${id}/leer`);
    return response.data;
  }

  async marcarTodasNotificaciones() {
    const response = await this.api.post('/notificaciones/leer-todas');
    return response.data;
  }

  async health() {
    const base = API_BASE_URL.replace(/\/api\/?$/, '');
    const response = await axios.get(`${base || ''}/health`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
