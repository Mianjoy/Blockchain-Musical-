import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function mapCancionFromApi(c) {
  if (!c) return null;
  const rawPrice = c.precio ?? c.price;
  const price = Number(rawPrice);
  return {
    id: c.id,
    blockchainId: c.id,
    title: c.titulo || c.title,
    artist: c.artista || c.artist,
    url: c.linkArchivo || c.url,
    price: Number.isFinite(price) ? price : 0,
    participants: (c.participantes || c.participants || []).map((p) => ({
      name: p.nombre || p.name,
      role: p.rol || p.role,
      percentage: p.porcentaje || p.percentage,
      usuarioId: p.usuarioId || p.nombre || p.name
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

  async register(nickname, password) {
    const response = await this.api.post('/auth/register', { nickname, password });
    return response.data?.datos || response.data;
  }

  async login(nickname, password) {
    const response = await this.api.post('/auth/login', { nickname, password });
    return response.data?.datos || response.data;
  }

  async checkNickname(nickname) {
    const encoded = encodeURIComponent(nickname);
    const response = await this.api.get(`/auth/check/${encoded}`);
    return response.data;
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
    const precio = Number(cancionData.price ?? cancionData.precio);
    if (!cancionData.usuarioId) {
      throw new Error('usuarioId (nickname @) es obligatorio');
    }
    const payload = {
      titulo: cancionData.title || cancionData.titulo,
      artista: cancionData.artist || cancionData.artista,
      linkArchivo: cancionData.url || cancionData.linkArchivo,
      precio,
      participantes: (cancionData.participants || cancionData.participantes || []).map((p) => {
        const nombre = p.name || p.nombre;
        return {
          nombre,
          usuarioId: p.usuarioId || nombre,
          rol: p.role || p.rol,
          porcentaje: Number(p.percentage ?? p.porcentaje)
        };
      }),
      usuarioId: cancionData.usuarioId
    };

    const response = await this.api.post('/canciones', payload);
    return response.data;
  }

  async comprarCancion(cancionId, compradorId, monto) {
    const response = await this.api.post('/compras', {
      cancionId,
      compradorId,
      monto: monto != null ? Number(monto) : undefined
    });
    return response.data;
  }

  async getComprasByUsuario(compradorId) {
    const response = await this.api.get('/compras', {
      params: { compradorId }
    });
    const list = response.data?.datos || response.data || [];
    return Array.isArray(list) ? list : [];
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

  async getDemoInfo() {
    const response = await this.api.get('/demo/info');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
