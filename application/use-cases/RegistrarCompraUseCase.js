const Transaccion = require('../../domain/value-objects/Transaccion');
const ICancionRepository = require('../../domain/interfaces/ICancionRepository');
const IContratoRepository = require('../../domain/interfaces/IContratoRepository');
const IBlockchainService = require('../../domain/interfaces/IBlockchainService');
const fabricLog = require('../../infrastructure/services/FabricWorkflowLog');

/**
 * Caso de Uso: RegistrarCompraUseCase
 * Registra una compra de canción y distribuye regalías automáticamente.
 */
class RegistrarCompraUseCase {
  /**
   * @param {IContratoRepository} contratoRepository
   * @param {IBlockchainService} blockchainService
   * @param {ICancionRepository} cancionRepository
   */
  constructor(contratoRepository, blockchainService, cancionRepository) {
    this.contratoRepository = contratoRepository;
    this.blockchainService = blockchainService;
    this.cancionRepository = cancionRepository;
  }

  async execute(datosCompra) {
    const { cancionId, compradorId, monto: montoCliente } = datosCompra;

    const flowId = fabricLog.beginFlow('COMPRA_Y_REGALIAS', {
      cancionId,
      compradorId,
      modoLedger: this.blockchainService.enSimulacion ? 'SIMULACION' : 'FABRIC'
    });

    try {
      const cancion = await this.cancionRepository.obtenerPorId(cancionId);
      if (!cancion) {
        throw new Error('Canción no encontrada');
      }
      if (!cancion.activa) {
        throw new Error('La canción no está activa');
      }
      fabricLog.step(flowId, '1_OBTENER_CANCION', 'OK', `titulo=${cancion.titulo}`);

      const precioCancion = Number(cancion.precio);
      const montoFallback = Number(montoCliente);
      let monto;
      if (Number.isFinite(precioCancion) && precioCancion > 0) {
        monto = precioCancion;
      } else if (Number.isFinite(montoFallback) && montoFallback > 0) {
        monto = montoFallback;
      } else {
        throw new Error(
          'La canción no tiene un precio válido. Vuelve a crearla con un precio mayor a 0.'
        );
      }
      fabricLog.step(flowId, '2_PRECIO', 'OK', `monto=${monto}`);

      const contrato = await this.contratoRepository.obtenerPorCancionId(cancionId);
      if (!contrato) {
        throw new Error('No se encontró un contrato para esta canción');
      }
      if (!contrato.activo) {
        throw new Error('El contrato no está activo');
      }
      fabricLog.step(flowId, '3_OBTENER_CONTRATO', 'OK', `contratoId=${contrato.id}`);

      const transaccionId = `transaccion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const transaccion = new Transaccion(
        transaccionId,
        contrato.id,
        monto,
        compradorId
      );

      const distribucion = contrato.distribuirRegalias(monto);
      transaccion.registrarDistribucion(distribucion);
      fabricLog.step(
        flowId,
        '4_DISTRIBUIR_REGALIAS',
        'OK',
        distribucion
          .map((d) => `${d.nombre || d.usuarioId}:${Number(d.monto).toFixed(2)}`)
          .join(', ')
      );

      await this.blockchainService.registrarTransaccion(transaccion);
      fabricLog.step(flowId, '5_LEDGER_TRANSACCION', 'OK', `txId=${transaccionId}`);

      contrato.registrarTransaccion(transaccion.toPlainObject());
      await this.contratoRepository.actualizar(contrato);
      fabricLog.step(flowId, '6_ACTUALIZAR_CONTRATO_LOCAL', 'OK');

      fabricLog.endFlow(
        flowId,
        'COMPLETADO',
        `comprador=${compradorId} monto=${monto} tx=${transaccionId}`
      );

      return {
        transaccion: transaccion.toPlainObject(),
        distribucion,
        monto,
        claveAcceso: cancion.claveAcceso || null
      };
    } catch (err) {
      fabricLog.step(flowId, 'ERROR', 'ERROR', err.message);
      fabricLog.endFlow(flowId, 'FALLIDO', err.message);
      throw err;
    }
  }
}

module.exports = RegistrarCompraUseCase;
