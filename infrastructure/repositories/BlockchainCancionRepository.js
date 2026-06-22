const Cancion = require('../../domain/entities/Cancion');
const Contrato = require('../../domain/entities/Contrato');
const ICancionRepository = require('../../domain/interfaces/ICancionRepository');

/**
 * Implementación del repositorio de canciones usando Hyperledger Fabric
 * Sigue el principio de inversión de dependencias (DIP)
 */
class BlockchainCancionRepository extends ICancionRepository {
  constructor(blockchainService) {
    super();
    this.blockchainService = blockchainService;
    this._cache = new Map();
  }

  async guardar(cancion) {
    // Validar que la canción sea una instancia válida
    if (!(cancion instanceof Cancion)) {
      throw new Error('El objeto debe ser una instancia de Cancion');
    }

    // Guardar en cache local
    this._cache.set(cancion.id, cancion);

    // La persistencia real se hace a través del servicio de blockchain
    return cancion;
  }

  async obtenerPorId(id) {
    // Intentar obtener del cache
    if (this._cache.has(id)) {
      return this._cache.get(id);
    }

    // Intentar obtener de blockchain
    try {
      const cancionData = await this.blockchainService.obtenerCancion(id);
      if (cancionData) {
        const cancion = Cancion.fromPlainObject(cancionData);
        this._cache.set(id, cancion);
        return cancion;
      }
    } catch (error) {
      console.error(`Error obteniendo canción ${id}:`, error.message);
    }

    return null;
  }

  async obtenerTodas() {
    // Devolver todas las canciones en cache
    return Array.from(this._cache.values()).map(c => c.toPlainObject());
  }

  async actualizar(cancion) {
    if (!(cancion instanceof Cancion)) {
      throw new Error('El objeto debe ser una instancia de Cancion');
    }

    // Actualizar en cache
    this._cache.set(cancion.id, cancion);

    // Actualizar en blockchain
    await this.blockchainService.registrarCancion(cancion);

    return cancion;
  }

  async eliminar(id) {
    const cancion = await this.obtenerPorId(id);
    if (!cancion) {
      throw new Error('Canción no encontrada');
    }

    cancion.desactivar();
    await this.actualizar(cancion);
    this._cache.delete(id);

    return true;
  }
}

module.exports = BlockchainCancionRepository;
