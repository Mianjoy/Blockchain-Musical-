'use strict';

const { Contract } = require('fabric-contract-api');

/**
 * Smart Contract para Sistema de Regalías Musicales
 * Hyperledger Fabric Chaincode
 */
class MusicRoyaltyContract extends Contract {
  constructor() {
    super('MusicRoyaltyContract');
  }

  async InitLedger(ctx) {
    console.log('MusicRoyaltyContract ledger initialized');
    return JSON.stringify({ status: 'ok' });
  }

  async crearCancion(ctx, cancionData) {
    const cancion = JSON.parse(cancionData);

    const existe = await this.cancionExiste(ctx, cancion.id);
    if (existe) {
      throw new Error(`La canción ${cancion.id} ya existe`);
    }

    await ctx.stub.putState(cancion.id, Buffer.from(JSON.stringify(cancion)));
    ctx.stub.setEvent('CancionCreada', Buffer.from(JSON.stringify(cancion)));
    return JSON.stringify(cancion);
  }

  async actualizarCancion(ctx, cancionData) {
    const cancion = JSON.parse(cancionData);
    const existe = await this.cancionExiste(ctx, cancion.id);
    if (!existe) {
      throw new Error(`La canción ${cancion.id} no existe`);
    }
    await ctx.stub.putState(cancion.id, Buffer.from(JSON.stringify(cancion)));
    return JSON.stringify(cancion);
  }

  async obtenerCancion(ctx, cancionId) {
    const existe = await this.cancionExiste(ctx, cancionId);
    if (!existe) {
      throw new Error(`La canción ${cancionId} no existe`);
    }
    const data = await ctx.stub.getState(cancionId);
    return data.toString();
  }

  async crearContrato(ctx, contratoData) {
    const contrato = JSON.parse(contratoData);

    const existe = await this.contratoExiste(ctx, contrato.id);
    if (existe) {
      throw new Error(`El contrato ${contrato.id} ya existe`);
    }

    if (!Array.isArray(contrato.transacciones)) {
      contrato.transacciones = [];
    }

    await ctx.stub.putState(contrato.id, Buffer.from(JSON.stringify(contrato)));

    const indexKey = `contrato_cancion_${contrato.cancionId}`;
    await ctx.stub.putState(indexKey, Buffer.from(contrato.id));

    ctx.stub.setEvent('ContratoCreado', Buffer.from(JSON.stringify(contrato)));
    return JSON.stringify(contrato);
  }

  async actualizarContrato(ctx, contratoData) {
    const contrato = JSON.parse(contratoData);
    const existe = await this.contratoExiste(ctx, contrato.id);
    if (!existe) {
      throw new Error(`El contrato ${contrato.id} no existe`);
    }
    await ctx.stub.putState(contrato.id, Buffer.from(JSON.stringify(contrato)));
    return JSON.stringify(contrato);
  }

  async obtenerContrato(ctx, contratoId) {
    const existe = await this.contratoExiste(ctx, contratoId);
    if (!existe) {
      throw new Error(`El contrato ${contratoId} no existe`);
    }
    const data = await ctx.stub.getState(contratoId);
    return data.toString();
  }

  async obtenerContratoPorCancion(ctx, cancionId) {
    const indexKey = `contrato_cancion_${cancionId}`;
    const contratoIdBytes = await ctx.stub.getState(indexKey);

    if (!contratoIdBytes || contratoIdBytes.length === 0) {
      throw new Error(`No se encontró contrato para la canción ${cancionId}`);
    }

    return await this.obtenerContrato(ctx, contratoIdBytes.toString());
  }

  async registrarTransaccion(ctx, transaccionData) {
    const transaccion = JSON.parse(transaccionData);

    const existe = await this.transaccionExiste(ctx, transaccion.id);
    if (existe) {
      throw new Error(`La transacción ${transaccion.id} ya existe`);
    }

    const contratoData = await this.obtenerContrato(ctx, transaccion.contratoId);
    const contrato = JSON.parse(contratoData);

    if (!contrato.activo) {
      throw new Error('El contrato no está activo');
    }

    await ctx.stub.putState(transaccion.id, Buffer.from(JSON.stringify(transaccion)));

    if (!Array.isArray(contrato.transacciones)) {
      contrato.transacciones = [];
    }
    const yaEnContrato = contrato.transacciones.some((t) => t && t.id === transaccion.id);
    if (!yaEnContrato) {
      contrato.transacciones.push(transaccion);
    }
    await ctx.stub.putState(contrato.id, Buffer.from(JSON.stringify(contrato)));

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

    return JSON.stringify(transaccion);
  }

  async generarClaveAcceso(ctx, cancionId, clave) {
    const claveKey = `clave_${cancionId}`;
    const existe = await ctx.stub.getState(claveKey);
    if (existe && existe.length > 0) {
      throw new Error(`Ya existe una clave para la canción ${cancionId}`);
    }

    const claveData = {
      cancionId,
      clave,
      fechaGeneracion: new Date().toISOString(),
      usada: false
    };

    await ctx.stub.putState(claveKey, Buffer.from(JSON.stringify(claveData)));

    const cancionRaw = await ctx.stub.getState(cancionId);
    if (cancionRaw && cancionRaw.length > 0) {
      const cancion = JSON.parse(cancionRaw.toString());
      cancion.claveAcceso = clave;
      await ctx.stub.putState(cancionId, Buffer.from(JSON.stringify(cancion)));
    }

    return JSON.stringify(claveData);
  }

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

    claveData.usada = true;
    await ctx.stub.putState(claveKey, Buffer.from(JSON.stringify(claveData)));

    return JSON.stringify({ valido: true, mensaje: 'Clave válida' });
  }

  async consultarTodasLasCanciones(ctx) {
    const iterator = await ctx.stub.getStateByRange('', '');
    const resultados = [];

    let result = await iterator.next();
    while (!result.done) {
      if (result.value && result.value.value) {
        try {
          const record = JSON.parse(result.value.value.toString('utf8'));
          if (record.titulo && record.artista) {
            resultados.push(record);
          }
        } catch (e) {
          // ignore non-JSON / non-song keys
        }
      }
      result = await iterator.next();
    }

    await iterator.close();
    return JSON.stringify(resultados);
  }

  async cancionExiste(ctx, cancionId) {
    const data = await ctx.stub.getState(cancionId);
    return !!(data && data.length > 0);
  }

  async contratoExiste(ctx, contratoId) {
    const data = await ctx.stub.getState(contratoId);
    return !!(data && data.length > 0);
  }

  async transaccionExiste(ctx, transaccionId) {
    const data = await ctx.stub.getState(transaccionId);
    return !!(data && data.length > 0);
  }
}

module.exports = MusicRoyaltyContract;
