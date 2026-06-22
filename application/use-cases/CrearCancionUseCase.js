const Cancion = require('../../domain/entities/Cancion');
const Contrato = require('../../domain/entities/Contrato');
const ClaveAcceso = require('../../domain/value-objects/ClaveAcceso');
const ICancionRepository = require('../../domain/interfaces/ICancionRepository');
const IContratoRepository = require('../../domain/interfaces/IContratoRepository');
const IBlockchainService = require('../../domain/interfaces/IBlockchainService');

/**
 * Caso de Uso: CrearCancionUseCase
 * Implementa el principio de responsabilidad única (SRP)
 */
class CrearCancionUseCase {
  /**
   * @param {ICancionRepository} cancionRepository
   * @param {IContratoRepository} contratoRepository
   * @param {IBlockchainService} blockchainService
   */
  constructor(cancionRepository, contratoRepository, blockchainService) {
    this.cancionRepository = cancionRepository;
    this.contratoRepository = contratoRepository;
    this.blockchainService = blockchainService;
  }

  /**
   * Ejecuta el caso de uso para crear una canción con su contrato
   * @param {Object} datosCancion - { titulo, artista, linkArchivo, participantes }
   * @returns {Promise<Object>} - { cancion, contrato, claveAcceso }
   */
  async execute(datosCancion) {
    const { titulo, artista, linkArchivo, participantes, usuarioId } = datosCancion;

    // Validar participantes
    const totalPorcentaje = participantes.reduce((sum, p) => sum + p.porcentaje, 0);
    if (totalPorcentaje !== 100) {
      throw new Error(`La suma de porcentajes debe ser 100%, actual: ${totalPorcentaje}%`);
    }

    // Crear entidad Cancion
    const id = `cancion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const cancion = new Cancion(
      id,
      titulo,
      artista,
      linkArchivo,
      participantes.map(p => ({ ...p, usuarioId })),
      new Date().toISOString()
    );

    // Validar canción
    cancion.validarParticipantes();

    // Guardar en repositorio
    await this.cancionRepository.guardar(cancion);

    // Crear contrato inteligente
    const contratoId = `contrato_${id}`;
    const contrato = new Contrato(
      contratoId,
      id,
      participantes,
      new Date().toISOString()
    );

    // Guardar contrato
    await this.contratoRepository.guardar(contrato);

    // Registrar en blockchain
    await this.blockchainService.registrarCancion(cancion);
    await this.blockchainService.registrarContrato(contrato);

    // Generar clave de acceso
    const claveAcceso = ClaveAcceso.generar(id);
    cancion.generarClaveAcceso(claveAcceso.valor);
    await this.cancionRepository.actualizar(cancion);

    return {
      cancion: cancion.toPlainObject(),
      contrato: contrato.toPlainObject(),
      claveAcceso: claveAcceso.toPlainObject()
    };
  }
}

module.exports = CrearCancionUseCase;
