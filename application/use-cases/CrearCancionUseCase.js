const Cancion = require('../../domain/entities/Cancion');
const Contrato = require('../../domain/entities/Contrato');
const ICancionRepository = require('../../domain/interfaces/ICancionRepository');
const IContratoRepository = require('../../domain/interfaces/IContratoRepository');
const IBlockchainService = require('../../domain/interfaces/IBlockchainService');
const { validateNickname } = require('../../domain/utils/nickname');
const fabricLog = require('../../infrastructure/services/FabricWorkflowLog');

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
    const { titulo, artista, linkArchivo, participantes, usuarioId, precio, price } = datosCancion;
    const precioFinal = Number(precio ?? price);

    const flowId = fabricLog.beginFlow('PUBLICAR_CANCION', {
      titulo,
      artista,
      precio: precioFinal,
      creador: usuarioId,
      modoLedger: this.blockchainService.enSimulacion ? 'SIMULACION' : 'FABRIC'
    });

    try {
      if (!Number.isFinite(precioFinal) || precioFinal <= 0) {
        throw new Error('El precio debe ser un número mayor que 0');
      }

      if (!Array.isArray(participantes) || participantes.length === 0) {
        throw new Error('Debe haber al menos un participante de regalías');
      }

      const creador = validateNickname(usuarioId || '');
      if (!creador.ok) {
        throw new Error(`usuarioId inválido: ${creador.error}`);
      }

      const participantesNorm = participantes.map((p, idx) => {
        const nick = validateNickname(p.nombre || p.name || p.usuarioId || '');
        if (!nick.ok) {
          throw new Error(
            `Participante #${idx + 1}: las regalías solo aceptan nickname @usuario. ${nick.error}`
          );
        }
        const porcentaje = Number(p.porcentaje ?? p.percentage);
        if (!Number.isFinite(porcentaje) || porcentaje <= 0) {
          throw new Error(`Participante ${nick.nickname}: porcentaje inválido`);
        }
        return {
          nombre: nick.nickname,
          usuarioId: nick.nickname,
          rol: p.rol || p.role || 'participante',
          porcentaje
        };
      });

      const totalPorcentaje = participantesNorm.reduce((sum, p) => sum + p.porcentaje, 0);
      if (Math.abs(totalPorcentaje - 100) > 0.01) {
        throw new Error(`La suma de porcentajes debe ser 100%, actual: ${totalPorcentaje}%`);
      }

      fabricLog.step(
        flowId,
        '1_VALIDACION_PARTICIPANTES',
        'OK',
        `nicks=${participantesNorm.map((p) => p.nombre).join(',')} suma%=${totalPorcentaje}`
      );

      const id = `cancion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const cancion = new Cancion(
        id,
        titulo,
        artista,
        linkArchivo,
        participantesNorm,
        new Date().toISOString(),
        precioFinal
      );

      cancion.validarParticipantes();
      await this.cancionRepository.guardar(cancion);
      fabricLog.step(flowId, '2_CACHE_LOCAL_CANCION', 'OK', `cancionId=${id}`);

      const contratoId = `contrato_${id}`;
      const contrato = new Contrato(
        contratoId,
        id,
        participantesNorm,
        new Date().toISOString()
      );

      await this.contratoRepository.guardar(contrato);
      fabricLog.step(flowId, '3_CACHE_LOCAL_CONTRATO', 'OK', `contratoId=${contratoId}`);

      await this.blockchainService.registrarCancion(cancion);
      fabricLog.step(flowId, '4_LEDGER_CANCION', 'OK', 'crearCancion / putState');

      await this.blockchainService.registrarContrato(contrato);
      fabricLog.step(flowId, '5_LEDGER_CONTRATO_REGALIAS', 'OK', 'crearContrato + % por @nick');

      const claveAcceso = await this.blockchainService.generarClaveAcceso(id);
      cancion.generarClaveAcceso(claveAcceso.valor);
      await this.cancionRepository.guardar(cancion);
      if (typeof this.blockchainService.actualizarCancion === 'function') {
        await this.blockchainService.actualizarCancion(cancion);
      }
      fabricLog.step(flowId, '6_CLAVE_ACCESO', 'OK', 'clave generada y persistida');

      fabricLog.endFlow(
        flowId,
        'COMPLETADO',
        `cancion=${id} contrato=${contratoId} participantes=${participantesNorm.length}`
      );

      return {
        cancion: cancion.toPlainObject(),
        contrato: contrato.toPlainObject(),
        claveAcceso: claveAcceso.toPlainObject()
      };
    } catch (err) {
      fabricLog.step(flowId, 'ERROR', 'ERROR', err.message);
      fabricLog.endFlow(flowId, 'FALLIDO', err.message);
      throw err;
    }
  }
}

module.exports = CrearCancionUseCase;
