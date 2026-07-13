const Cancion = require('../../domain/entities/Cancion');
const Contrato = require('../../domain/entities/Contrato');
const ICancionRepository = require('../../domain/interfaces/ICancionRepository');
const IContratoRepository = require('../../domain/interfaces/IContratoRepository');
const IBlockchainService = require('../../domain/interfaces/IBlockchainService');

/**
 * Caso de Uso: CrearCancionUseCase
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

  async execute(datosCancion) {
    const { titulo, artista, linkArchivo, participantes, usuarioId } = datosCancion;

    const totalPorcentaje = participantes.reduce((sum, p) => sum + p.porcentaje, 0);
    if (totalPorcentaje !== 100) {
      throw new Error(`La suma de porcentajes debe ser 100%, actual: ${totalPorcentaje}%`);
    }

    const id = `cancion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const cancion = new Cancion(
      id,
      titulo,
      artista,
      linkArchivo,
      participantes.map((p) => ({ ...p, usuarioId })),
      new Date().toISOString()
    );

    cancion.validarParticipantes();
    await this.cancionRepository.guardar(cancion);

    const contratoId = `contrato_${id}`;
    const contrato = new Contrato(
      contratoId,
      id,
      participantes,
      new Date().toISOString()
    );

    await this.contratoRepository.guardar(contrato);

    await this.blockchainService.registrarCancion(cancion);
    await this.blockchainService.registrarContrato(contrato);

    const claveAcceso = await this.blockchainService.generarClaveAcceso(id);
    cancion.generarClaveAcceso(claveAcceso.valor);
    await this.cancionRepository.guardar(cancion);

    return {
      cancion: cancion.toPlainObject(),
      contrato: contrato.toPlainObject(),
      claveAcceso: claveAcceso.toPlainObject()
    };
  }
}

module.exports = CrearCancionUseCase;
