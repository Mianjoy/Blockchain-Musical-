const Transaccion = require('../../domain/value-objects/Transaccion');
const IContratoRepository = require('../../domain/interfaces/IContratoRepository');
const IBlockchainService = require('../../domain/interfaces/IBlockchainService');

/**
 * Caso de Uso: RegistrarCompraUseCase
 * Registra una compra de canción y distribuye regalías automáticamente
 */
class RegistrarCompraUseCase {
  /**
   * @param {IContratoRepository} contratoRepository
   * @param {IBlockchainService} blockchainService
   */
  constructor(contratoRepository, blockchainService) {
    this.contratoRepository = contratoRepository;
    this.blockchainService = blockchainService;
  }

  /**
   * Ejecuta el caso de uso para registrar una compra
   * @param {Object} datosCompra - { cancionId, monto, compradorId }
   * @returns {Promise<Object>} - { transaccion, distribucion }
   */
  async execute(datosCompra) {
    const { cancionId, monto, compradorId } = datosCompra;

    // Obtener contrato de la canción
    const contrato = await this.contratoRepository.obtenerPorCancionId(cancionId);
    if (!contrato) {
      throw new Error('No se encontró un contrato para esta canción');
    }

    if (!contrato.activo) {
      throw new Error('El contrato no está activo');
    }

    // Crear transacción
    const transaccionId = `transaccion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transaccion = new Transaccion(
      transaccionId,
      contrato.id,
      monto,
      compradorId
    );

    // Distribuir regalías según contrato
    const distribucion = contrato.distribuirRegalias(monto);

    // Registrar distribución en la transacción
    transaccion.registrarDistribucion(distribucion);

    // Registrar transacción en el contrato
    contrato.registrarTransaccion(transaccion.toPlainObject());
    await this.contratoRepository.actualizar(contrato);

    // Registrar en blockchain
    await this.blockchainService.registrarTransaccion(transaccion);

    return {
      transaccion: transaccion.toPlainObject(),
      distribucion: distribucion
    };
  }
}

module.exports = RegistrarCompraUseCase;
