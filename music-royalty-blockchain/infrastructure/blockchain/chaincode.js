// SPDX-License-Identifier: Apache-2.0
/*
 * Smart Contract para Sistema de Regalías Musicales
 * Implementado en Hyperledger Fabric (Chaincode)
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class MusicRoyaltyContract extends Contract {

  /**
   * Crea una nueva canción en la blockchain
   * @param {Context} ctx - Contexto de transacción
   * @param {string} cancionData - JSON con datos de la canción
   */
  async crearCancion(ctx, cancionData) {
    const cancion = JSON.parse(cancionData);
    
    // Validar que la canción no exista
    const existe = await this.cancionExiste(ctx, cancion.id);
    if (existe) {
      throw new Error(`La canción ${cancion.id} ya existe`);
    }

    // Guardar en el ledger
    await ctx.stub.putState(cancion.id, Buffer.from(cancionData));
    
    // Emitir evento
    ctx.stub.setEvent('CancionCreada', Buffer.from(cancionData));
    
    console.log(`Canción creada: ${cancion.id}`);
    return cancionData;
  }

  /**
   * Obtiene una canción por su ID
   * @param {Context} ctx - Contexto de transacción
   * @param {string} cancionId - ID de la canción
   */
  async obtenerCancion(ctx, cancionId) {
    const existe = await this.cancionExiste(ctx, cancionId);
    if (!existe) {
      throw new Error(`La canción ${cancionId} no existe`);
    }

    const data = await ctx.stub.getState(cancionId);
    return data.toString();
  }

  /**
   * Crea un contrato inteligente para una canción
   * @param {Context} ctx - Contexto de transacción
   * @param {string} contratoData - JSON con datos del contrato
   */
  async crearContrato(ctx, contratoData) {
    const contrato = JSON.parse(contratoData);
    
    // Validar que el contrato no exista
    const existe = await this.contratoExiste(ctx, contrato.id);
    if (existe) {
      throw new Error(`El contrato ${contrato.id} ya existe`);
    }

    // Guardar en el ledger
    await ctx.stub.putState(contrato.id, Buffer.from(contratoData));
    
    // Crear índice por canción
    const indexKey = `contrato_cancion_${contrato.cancionId}`;
    await ctx.stub.putState(indexKey, Buffer.from(contrato.id));
    
    // Emitir evento
    ctx.stub.setEvent('ContratoCreado', Buffer.from(contratoData));
    
    console.log(`Contrato creado: ${contrato.id}`);
    return contratoData;
  }

  /**
   * Obtiene un contrato por su ID
   * @param {Context} ctx - Contexto de transacción
   * @param {string} contratoId - ID del contrato
   */
  async obtenerContrato(ctx, contratoId) {
    const existe = await this.contratoExiste(ctx, contratoId);
    if (!existe) {
      throw new Error(`El contrato ${contratoId} no existe`);
    }

    const data = await ctx.stub.getState(contratoId);
    return data.toString();
  }

  /**
   * Obtiene un contrato por el ID de la canción
   * @param {Context} ctx - Contexto de transacción
   * @param {string} cancionId - ID de la canción
   */
  async obtenerContratoPorCancion(ctx, cancionId) {
    const indexKey = `contrato_cancion_${cancionId}`;
    const contratoId = await ctx.stub.getState(indexKey);
    
    if (!contratoId || contratoId.length === 0) {
      throw new Error(`No se encontró contrato para la canción ${cancionId}`);
    }

    return await this.obtenerContrato(ctx, contratoId.toString());
  }

  /**
   * Registra una transacción de compra y distribuye regalías
   * @param {Context} ctx - Contexto de transacción
   * @param {string} transaccionData - JSON con datos de la transacción
   */
  async registrarTransaccion(ctx, transaccionData) {
    const transaccion = JSON.parse(transaccionData);
    
    // Validar que la transacción no exista
    const existe = await this.transaccionExiste(ctx, transaccion.id);
    if (existe) {
      throw new Error(`La transacción ${transaccion.id} ya existe`);
    }

    // Obtener el contrato asociado
    const contratoData = await this.obtenerContrato(ctx, transaccion.contratoId);
    const contrato = JSON.parse(contratoData);

    // Verificar que el contrato esté activo
    if (!contrato.activo) {
      throw new Error('El contrato no está activo');
    }

    // Guardar transacción en el ledger
    await ctx.stub.putState(transaccion.id, Buffer.from(transaccionData));

    // Actualizar el contrato con la nueva transacción
    contrato.transacciones.push(JSON.parse(transaccionData));
    await ctx.stub.putState(contrato.id, Buffer.from(JSON.stringify(contrato)));

    // Emitir evento para cada distribución de regalías
    if (transaccion.distribucion && transaccion.distribucion.length > 0) {
      for (const distribucion of transaccion.distribucion) {
        const eventoData = JSON.stringify({
          transaccionId: transaccion.id,
          beneficiario: distribucion.nombre,
          monto: distribucion.monto,
          rol: distribucion.rol
        });
        ctx.stub.setEvent('RegaliaDistribuida', Buffer.from(eventoData));
      }
    }

    console.log(`Transacción registrada: ${transaccion.id}`);
    return transaccionData;
  }

  /**
   * Genera una clave de acceso para una canción
   * @param {Context} ctx - Contexto de transacción
   * @param {string} cancionId - ID de la canción
   * @param {string} clave - Clave de acceso
   */
  async generarClaveAcceso(ctx, cancionId, clave) {
    const claveKey = `clave_${cancionId}`;
    
    // Verificar si ya existe una clave
    const existe = await ctx.stub.getState(claveKey);
    if (existe && existe.length > 0) {
      throw new Error(`Ya existe una clave para la canción ${cancionId}`);
    }

    const claveData = JSON.stringify({
      cancionId,
      clave,
      fechaGeneracion: new Date().toISOString(),
      usada: false
    });

    await ctx.stub.putState(claveKey, Buffer.from(claveData));
    
    console.log(`Clave generada para canción: ${cancionId}`);
    return claveData;
  }

  /**
   * Valida una clave de acceso
   * @param {Context} ctx - Contexto de transacción
   * @param {string} cancionId - ID de la canción
   * @param {string} clave - Clave a validar
   */
  async validarClaveAcceso(ctx, cancionId, clave) {
    const claveKey = `clave_${cancionId}`;
    const data = await ctx.stub.getState(claveKey);
    
    if (!data || data.length === 0) {
      return JSON.stringify({ valido: false, mensaje: 'Clave no encontrada' });
    }

    const claveData = JSON.parse(data.toString());
    
    if (claveData.clave !== clave) {
      return JSON.stringify({ valido: false, mensaje: 'Clave inválida' });
    }

    if (claveData.usada) {
      return JSON.stringify({ valido: false, mensaje: 'Clave ya usada' });
    }

    // Marcar como usada
    claveData.usada = true;
    await ctx.stub.putState(claveKey, Buffer.from(JSON.stringify(claveData)));

    return JSON.stringify({ valido: true, mensaje: 'Clave válida' });
  }

  /**
   * Consulta todas las canciones
   * @param {Context} ctx - Contexto de transacción
   */
  async consultarTodasLasCanciones(ctx) {
    const iterator = await ctx.stub.getStateByRange('', 'z');
    const resultados = [];
    
    let resultado = await iterator.next();
    while (!resultado.done) {
      if (resultado.value) {
        try {
          const cancion = JSON.parse(resultado.value.value.toString('utf8'));
          if (cancion.titulo) { // Es una canción
            resultados.push(cancion);
          }
        } catch (error) {
          // Ignorar registros que no son JSON válido
        }
      }
      resultado = await iterator.next();
    }
    
    await iterator.close();
    return JSON.stringify(resultados);
  }

  /**
   * Helper: Verifica si una canción existe
   */
  async cancionExiste(ctx, cancionId) {
    const data = await ctx.stub.getState(cancionId);
    return data && data.length > 0;
  }

  /**
   * Helper: Verifica si un contrato existe
   */
  async contratoExiste(ctx, contratoId) {
    const data = await ctx.stub.getState(contratoId);
    return data && data.length > 0;
  }

  /**
   * Helper: Verifica si una transacción existe
   */
  async transaccionExiste(ctx, transaccionId) {
    const data = await ctx.stub.getState(transaccionId);
    return data && data.length > 0;
  }
}

module.exports = MusicRoyaltyContract;
