'use strict';

/**
 * Smoke test: Gateway + getNetwork(mychannel).
 * Exit 0 = OK Fabric real. Exit 1 = fallo (p.ej. access denied).
 */
const HyperledgerFabricService = require('../infrastructure/blockchain/HyperledgerFabricService');

async function main() {
  const svc = new HyperledgerFabricService({
    allowSimulation: false,
    asLocalhost: process.env.FABRIC_AS_LOCALHOST !== 'false'
  });

  try {
    await svc.inicializar();
    if (svc.enSimulacion) {
      throw new Error('Quedo en simulacion (no valido)');
    }
    // Lectura barata del ledger via chaincode si existe
    try {
      await svc.contract.evaluateTransaction('Ping');
    } catch (_) {
      // Ping puede no existir; getNetwork ya valido discovery
    }
    console.log('[OK] verifyFabricSdk: Gateway conectado a Fabric');
    await svc.desconectar();
    process.exit(0);
  } catch (err) {
    console.error('[ERROR] verifyFabricSdk:', err.message || err);
    try {
      await svc.desconectar();
    } catch (_) {
      /* ignore */
    }
    process.exit(1);
  }
}

main();
