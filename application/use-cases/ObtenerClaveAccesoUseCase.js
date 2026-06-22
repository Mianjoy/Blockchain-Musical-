const ICancionRepository = require('../../domain/interfaces/ICancionRepository');
const IBlockchainService = require('../../domain/interfaces/IBlockchainService');

/**
 * Caso de Uso: ObtenerClaveAccesoUseCase
 * Obtiene y valida una clave de acceso para descargar una canción
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

  /**
   * Ejecuta el caso de uso para obtener la clave de acceso
   * @param {Object} datos - { cancionId }
   * @returns {Promise<Object>} - { claveAcceso, linkArchivo }
   */
  async execute(datos) {
    const { cancionId } = datos;

    // Obtener canción
    const cancion = await this.cancionRepository.obtenerPorId(cancionId);
    if (!cancion) {
      throw new Error('Canción no encontrada');
    }

    if (!cancion.activa) {
      throw new Error('La canción no está disponible');
    }

    // Validar en blockchain
    const claveValida = await this.blockchainService.validarClaveAcceso(
      cancionId,
      cancion.claveAcceso
    );

    if (!claveValida) {
      throw new Error('La clave de acceso no es válida o ya fue usada');
    }

    return {
      claveAcceso: cancion.claveAcceso,
      linkArchivo: cancion.linkArchivo,
      titulo: cancion.titulo,
      artista: cancion.artista
    };
  }
}

module.exports = ObtenerClaveAccesoUseCase;
