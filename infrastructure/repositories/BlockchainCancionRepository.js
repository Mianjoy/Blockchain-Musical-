const Cancion = require('../../domain/entities/Cancion');
const ICancionRepository = require('../../domain/interfaces/ICancionRepository');

/**
 * Repositorio de canciones respaldado por Hyperledger Fabric (+ cache local)
 */
class BlockchainCancionRepository extends ICancionRepository {
  constructor(blockchainService) {
    super();
    this.blockchainService = blockchainService;
    this._cache = new Map();
  }

  async guardar(cancion) {
    if (!(cancion instanceof Cancion)) {
      throw new Error('El objeto debe ser una instancia de Cancion');
    }

    this._cache.set(cancion.id, cancion);
    return cancion;
  }

  async obtenerPorId(id) {
    if (this._cache.has(id)) {
      return this._cache.get(id);
    }

    try {
      const cancionData = await this.blockchainService.obtenerCancion(id);
      if (cancionData) {
        const cancion = Cancion.fromPlainObject(cancionData);
        if (cancionData.claveAcceso) {
          cancion._claveAcceso = cancionData.claveAcceso;
        }
        this._cache.set(id, cancion);
        return cancion;
      }
    } catch (error) {
      console.error(`Error obteniendo canción ${id}:`, error.message);
    }

    return null;
  }

  async obtenerTodas() {
    try {
      const fromChain = await this.blockchainService.obtenerTodasLasCanciones();
      if (Array.isArray(fromChain) && fromChain.length > 0) {
        for (const item of fromChain) {
          const prev = this._cache.get(item.id);
          const entity = Cancion.fromPlainObject(item);
          // No pisar clave que ya teníamos en memoria si el ledger viene sin ella
          if (!entity.claveAcceso && prev?.claveAcceso) {
            entity._claveAcceso = prev.claveAcceso;
          }
          if (!entity.claveAcceso && this.blockchainService._simStore?.claves) {
            const k = this.blockchainService._simStore.claves.get(item.id);
            if (k) entity._claveAcceso = k;
          }
          this._cache.set(entity.id, entity);
        }
      }
    } catch (error) {
      console.error('Error listando canciones desde blockchain:', error.message);
    }

    return Array.from(this._cache.values()).map((c) => c.toPlainObject());
  }

  async actualizar(cancion) {
    if (!(cancion instanceof Cancion)) {
      throw new Error('El objeto debe ser una instancia de Cancion');
    }

    this._cache.set(cancion.id, cancion);
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
