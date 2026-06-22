import axios from 'axios';

const API_BASE_URL = '/api';

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
    return response.data;
  }

  async getCancionById(id) {
    const response = await this.api.get(`/canciones/${id}`);
    return response.data;
  }

  async crearCancion(cancionData) {
    const response = await this.api.post('/canciones', cancionData);
    return response.data;
  }

  async comprarCancion(cancionId, compradorId) {
    const response = await this.api.post('/compras', {
      cancionId,
      compradorId
    });
    return response.data;
  }

  async getComprasByUsuario(usuarioId) {
    const response = await this.api.get(`/compras/usuario/${usuarioId}`);
    return response.data;
  }

  async obtenerClaveAcceso(compraId) {
    const response = await this.api.get(`/compras/${compraId}/clave`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
