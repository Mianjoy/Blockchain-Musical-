const ICancionRepository = require('../../domain/interfaces/ICancionRepository');
const IBlockchainService = require('../../domain/interfaces/IBlockchainService');

/**
 * Caso de Uso: ObtenerClaveAccesoUseCase
 * Devuelve la clave de acceso registrada para una canción (sin consumirla).
 */
class ObtenerClaveAccesoUseCase {
  /**
   * @param {ICancionRepository} cancionRepository
   * @param {IBlockchainService} blockchainService
   */
  constructor(cancionRepository, blockchainService) {
    this.cancionRepository = cancionRepository;
    this.blockchainService = blockchainService;
  }

  async execute(datos) {
    const { cancionId } = datos;

    const cancion = await this.cancionRepository.obtenerPorId(cancionId);
    if (!cancion) {
      throw new Error('Canción no encontrada');
    }

    if (!cancion.activa) {
      throw new Error('La canción no está disponible');
    }

    let clave = cancion.claveAcceso;
    if (!clave) {
      const fromChain = await this.blockchainService.obtenerCancion(cancionId);
      clave = fromChain?.claveAcceso;
    }
    if (!clave && this.blockchainService._simStore?.claves) {
      clave = this.blockchainService._simStore.claves.get(cancionId) || null;
    }

    if (!clave) {
      throw new Error('La canción no tiene clave de acceso generada');
    }

    return {
      claveAcceso: clave,
      linkArchivo: cancion.linkArchivo,
      titulo: cancion.titulo,
      artista: cancion.artista
    };
  }
}

module.exports = ObtenerClaveAccesoUseCase;
