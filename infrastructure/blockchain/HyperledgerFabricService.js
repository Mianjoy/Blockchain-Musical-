const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const Cancion = require('../../domain/entities/Cancion');
const Contrato = require('../../domain/entities/Contrato');
const Transaccion = require('../../domain/value-objects/Transaccion');
const ClaveAcceso = require('../../domain/value-objects/ClaveAcceso');
const IBlockchainService = require('../../domain/interfaces/IBlockchainService');

/**
 * Servicio Hyperledger Fabric.
 * Modo simulación SOLO si ALLOW_SIMULATION=true o config.allowSimulation=true.
 */
class HyperledgerFabricService extends IBlockchainService {
  constructor(config = {}) {
    super();
    this.config = {
      walletPath: config.walletPath || path.join(__dirname, '../../../wallet'),
      connectionProfile:
        config.connectionProfile ||
        process.env.CONNECTION_PROFILE ||
        path.join(__dirname, '../../../connection.json'),
      channelName: config.channelName || process.env.CHANNEL_NAME || 'mychannel',
      chaincodeName: config.chaincodeName || process.env.CHAINCODE_NAME || 'music-royalty',
      mspId: config.mspId || 'Org1MSP',
      identity: config.identity || 'appUser',
      // true = API en host Windows (localhost). false = API en Docker (DNS peer/orderer)
      asLocalhost:
        config.asLocalhost !== undefined
          ? config.asLocalhost
          : process.env.FABRIC_AS_LOCALHOST !== 'false',
      allowSimulation:
        config.allowSimulation === true ||
        process.env.ALLOW_SIMULATION === 'true' ||
        process.env.MODO_SIMULACION === 'true'
    };
    this.gateway = null;
    this.network = null;
    this.contract = null;
    this._modoSimulacion = false;
    this._claveCache = new Map();
    this._simStore = {
      canciones: new Map(),
      contratos: new Map(),
      contratosPorCancion: new Map(),
      claves: new Map()
    };
  }

  get enSimulacion() {
    return this._modoSimulacion;
  }

  async inicializar() {
    if (this.config.allowSimulation && process.env.FORCE_FABRIC !== 'true') {
      // Solo entra en simulación directa si se fuerza por env sin intentar Fabric,
      // excepto cuando ALLOW_SIMULATION está activo como fallback tras error.
    }

    const connectionPath = this.config.connectionProfile;
    if (!fs.existsSync(connectionPath)) {
      return this._activarSimulacionOFallar(
        `No existe connection.json en ${connectionPath}. Ejecuta start-system.bat o network/scripts/network.sh up`
      );
    }

    try {
      const wallet = await Wallets.newFileSystemWallet(this.config.walletPath);
      const identity = await wallet.get(this.config.identity);
      if (!identity) {
        throw new Error(
          `Identidad '${this.config.identity}' no encontrada en wallet. Ejecuta: node scripts/enrollAppUser.js`
        );
      }

      const ccp = JSON.parse(fs.readFileSync(connectionPath, 'utf8'));
      this.gateway = new Gateway();
      await this.gateway.connect(ccp, {
        wallet,
        identity: this.config.identity,
        discovery: {
          enabled: true,
          asLocalhost: this.config.asLocalhost !== false
        }
      });

      this.network = await this.gateway.getNetwork(this.config.channelName);
      this.contract = this.network.getContract(this.config.chaincodeName);
      this._modoSimulacion = false;

      console.log('Conexión a Hyperledger Fabric establecida correctamente');
      console.log(`  Canal: ${this.config.channelName}`);
      console.log(`  Chaincode: ${this.config.chaincodeName}`);
      console.log(`  Perfil: ${connectionPath}`);
      console.log(`  asLocalhost: ${this.config.asLocalhost !== false}`);
      return true;
    } catch (error) {
      console.error('Error inicializando Hyperledger Fabric:', error.message);
      return this._activarSimulacionOFallar(error.message);
    }
  }

  _activarSimulacionOFallar(motivo) {
    if (this.config.allowSimulation) {
      this._modoSimulacion = true;
      console.warn(`[SIMULACIÓN] Activada porque ALLOW_SIMULATION=true. Motivo: ${motivo}`);
      return false;
    }
    throw new Error(
      `No se pudo conectar a Hyperledger Fabric y la simulación está desactivada. ${motivo}. ` +
        `Para forzar simulación: ALLOW_SIMULATION=true`
    );
  }

  async registrarCancion(cancion) {
    if (!(cancion instanceof Cancion)) {
      throw new Error('El objeto debe ser una instancia de Cancion');
    }

    const cancionData = JSON.stringify(cancion.toPlainObject());

    if (this._modoSimulacion) {
      this._simStore.canciones.set(cancion.id, cancion.toPlainObject());
      console.log('[SIMULACIÓN] Registrando canción:', cancion.id);
      return true;
    }

    await this.contract.submitTransaction('crearCancion', cancionData);
    console.log('Canción registrada en blockchain:', cancion.id);
    return true;
  }

  async actualizarCancion(cancion) {
    if (!(cancion instanceof Cancion)) {
      throw new Error('El objeto debe ser una instancia de Cancion');
    }

    const cancionData = JSON.stringify(cancion.toPlainObject());

    if (this._modoSimulacion) {
      this._simStore.canciones.set(cancion.id, cancion.toPlainObject());
      return true;
    }

    await this.contract.submitTransaction('actualizarCancion', cancionData);
    return true;
  }

  async registrarContrato(contrato) {
    if (!(contrato instanceof Contrato)) {
      throw new Error('El objeto debe ser una instancia de Contrato');
    }

    const contratoData = JSON.stringify(contrato.toPlainObject());

    if (this._modoSimulacion) {
      // Copia profunda superficial para no compartir arrays con la entidad en caché
      const plain = JSON.parse(JSON.stringify(contrato.toPlainObject()));
      this._simStore.contratos.set(contrato.id, plain);
      this._simStore.contratosPorCancion.set(contrato.cancionId, contrato.id);
      console.log('[SIMULACIÓN] Registrando contrato:', contrato.id);
      return true;
    }

    await this.contract.submitTransaction('crearContrato', contratoData);
    console.log('Contrato registrado en blockchain:', contrato.id);
    return true;
  }

  async actualizarContrato(contrato) {
    if (!(contrato instanceof Contrato)) {
      throw new Error('El objeto debe ser una instancia de Contrato');
    }

    const contratoData = JSON.stringify(contrato.toPlainObject());

    if (this._modoSimulacion) {
      const plain = JSON.parse(JSON.stringify(contrato.toPlainObject()));
      this._simStore.contratos.set(contrato.id, plain);
      this._simStore.contratosPorCancion.set(contrato.cancionId, contrato.id);
      return true;
    }

    await this.contract.submitTransaction('actualizarContrato', contratoData);
    return true;
  }

  async registrarTransaccion(transaccion) {
    if (!(transaccion instanceof Transaccion)) {
      throw new Error('El objeto debe ser una instancia de Transaccion');
    }

    const plain = transaccion.toPlainObject();
    const transaccionData = JSON.stringify(plain);

    if (this._modoSimulacion) {
      if (!this._simStore.transacciones) {
        this._simStore.transacciones = new Map();
      }

      // Idempotencia: misma TX no se vuelve a anexar
      if (this._simStore.transacciones.has(transaccion.id)) {
        console.log('[SIMULACIÓN] Transacción ya registrada:', transaccion.id);
        return true;
      }
      this._simStore.transacciones.set(transaccion.id, plain);

      const contrato = this._simStore.contratos.get(transaccion.contratoId);
      if (contrato) {
        if (!Array.isArray(contrato.transacciones)) {
          contrato.transacciones = [];
        }
        const yaExiste = contrato.transacciones.some((t) => t && t.id === transaccion.id);
        if (!yaExiste) {
          contrato.transacciones.push(plain);
        }
        this._simStore.contratos.set(contrato.id, {
          ...contrato,
          transacciones: [...contrato.transacciones]
        });
      }

      console.log('[SIMULACIÓN] Registrando transacción:', transaccion.id);
      return true;
    }

    await this.contract.submitTransaction('registrarTransaccion', transaccionData);
    console.log('Transacción registrada en blockchain:', transaccion.id);
    return true;
  }

  async obtenerCancion(id) {
    if (this._modoSimulacion) {
      return this._simStore.canciones.get(id) || null;
    }

    try {
      const result = await this.contract.evaluateTransaction('obtenerCancion', id);
      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Error obteniendo canción:', error.message);
      return null;
    }
  }

  async obtenerTodasLasCanciones() {
    if (this._modoSimulacion) {
      return Array.from(this._simStore.canciones.values());
    }

    try {
      const result = await this.contract.evaluateTransaction('consultarTodasLasCanciones');
      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Error listando canciones:', error.message);
      return [];
    }
  }

  async obtenerContrato(id) {
    if (this._modoSimulacion) {
      return this._simStore.contratos.get(id) || null;
    }

    try {
      const result = await this.contract.evaluateTransaction('obtenerContrato', id);
      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Error obteniendo contrato:', error.message);
      return null;
    }
  }

  async obtenerContratoPorCancion(cancionId) {
    if (this._modoSimulacion) {
      const contratoId = this._simStore.contratosPorCancion.get(cancionId);
      return contratoId ? this._simStore.contratos.get(contratoId) || null : null;
    }

    try {
      const result = await this.contract.evaluateTransaction('obtenerContratoPorCancion', cancionId);
      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Error obteniendo contrato por canción:', error.message);
      return null;
    }
  }

  async generarClaveAcceso(cancionId) {
    const clave = ClaveAcceso.generar(cancionId);

    if (this._modoSimulacion) {
      this._simStore.claves.set(cancionId, clave.valor);
      this._claveCache.set(cancionId, clave);
      const song = this._simStore.canciones.get(cancionId);
      if (song) {
        song.claveAcceso = clave.valor;
        this._simStore.canciones.set(cancionId, song);
      }
      return clave;
    }

    await this.contract.submitTransaction('generarClaveAcceso', cancionId, clave.valor);
    this._claveCache.set(cancionId, clave);
    return clave;
  }

  async validarClaveAcceso(cancionId, clave) {
    if (this._claveCache.has(cancionId)) {
      const claveGuardada = this._claveCache.get(cancionId);
      if (claveGuardada.validar(clave)) {
        claveGuardada.marcarComoUsada();
        return true;
      }
    }

    if (this._modoSimulacion) {
      return this._simStore.claves.get(cancionId) === clave;
    }

    try {
      const result = await this.contract.evaluateTransaction('validarClaveAcceso', cancionId, clave);
      const parsed = JSON.parse(result.toString());
      return parsed.valido === true;
    } catch (error) {
      console.error('Error validando clave:', error.message);
      return false;
    }
  }

  async desconectar() {
    if (this.gateway) {
      this.gateway.disconnect();
      console.log('Conexión con blockchain cerrada');
    }
  }
}

module.exports = HyperledgerFabricService;
