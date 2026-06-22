const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const Cancion = require('../../domain/entities/Cancion');
const Contrato = require('../../domain/entities/Contrato');
const Transaccion = require('../../domain/value-objects/Transaccion');
const ClaveAcceso = require('../../domain/value-objects/ClaveAcceso');
const IBlockchainService = require('../../domain/interfaces/IBlockchainService');

/**
 * Implementación del servicio de blockchain usando Hyperledger Fabric
 * Sigue el principio de responsabilidad única (SRP) y DIP
 */
class HyperledgerFabricService extends IBlockchainService {
  constructor(config = {}) {
    super();
    this.config = {
      walletPath: config.walletPath || path.join(__dirname, '../../../wallet'),
      connectionProfile: config.connectionProfile || path.join(__dirname, '../../../connection.json'),
      channelName: config.channelName || 'mychannel',
      chaincodeName: config.chaincodeName || 'music-royalty',
      mspId: config.mspId || 'Org1MSP'
    };
    this.gateway = null;
    this.network = null;
    this.contract = null;
    this._claveCache = new Map();
  }

  /**
   * Inicializa la conexión con Hyperledger Fabric
   */
  async inicializar() {
    try {
      // Crear wallet
      const wallet = await Wallets.newFileSystemWallet(this.config.walletPath);
      
      // Configurar gateway
      this.gateway = new Gateway();
      await this.gateway.connect(this.config.connectionProfile, {
        wallet,
        identity: 'appUser',
        discovery: { enabled: true, asLocalhost: true }
      });

      // Conectar al canal y contrato
      this.network = await this.gateway.getNetwork(this.config.channelName);
      this.contract = this.network.getContract(this.config.chaincodeName);

      console.log('Conexión a Hyperledger Fabric establecida correctamente');
      return true;
    } catch (error) {
      console.error('Error inicializando Hyperledger Fabric:', error.message);
      // En modo desarrollo/testing, permitir operación sin blockchain real
      this._modoSimulacion = true;
      console.log('Operando en modo simulación');
      return false;
    }
  }

  /**
   * Registra una canción en la blockchain
   */
  async registrarCancion(cancion) {
    if (!(cancion instanceof Cancion)) {
      throw new Error('El objeto debe ser una instancia de Cancion');
    }

    if (this._modoSimulacion) {
      console.log('[SIMULACIÓN] Registrando canción:', cancion.id);
      return true;
    }

    try {
      const cancionData = JSON.stringify(cancion.toPlainObject());
      await this.contract.submitTransaction('crearCancion', cancionData);
      console.log('Canción registrada en blockchain:', cancion.id);
      return true;
    } catch (error) {
      console.error('Error registrando canción:', error.message);
      throw error;
    }
  }

  /**
   * Registra un contrato en la blockchain
   */
  async registrarContrato(contrato) {
    if (!(contrato instanceof Contrato)) {
      throw new Error('El objeto debe ser una instancia de Contrato');
    }

    if (this._modoSimulacion) {
      console.log('[SIMULACIÓN] Registrando contrato:', contrato.id);
      return true;
    }

    try {
      const contratoData = JSON.stringify(contrato.toPlainObject());
      await this.contract.submitTransaction('crearContrato', contratoData);
      console.log('Contrato registrado en blockchain:', contrato.id);
      return true;
    } catch (error) {
      console.error('Error registrando contrato:', error.message);
      throw error;
    }
  }

  /**
   * Registra una transacción en la blockchain
   */
  async registrarTransaccion(transaccion) {
    if (!(transaccion instanceof Transaccion)) {
      throw new Error('El objeto debe ser una instancia de Transaccion');
    }

    if (this._modoSimulacion) {
      console.log('[SIMULACIÓN] Registrando transacción:', transaccion.id);
      return true;
    }

    try {
      const transaccionData = JSON.stringify(transaccion.toPlainObject());
      await this.contract.submitTransaction('registrarTransaccion', transaccionData);
      console.log('Transacción registrada en blockchain:', transaccion.id);
      return true;
    } catch (error) {
      console.error('Error registrando transacción:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene una canción desde la blockchain
   */
  async obtenerCancion(id) {
    if (this._modoSimulacion) {
      console.log('[SIMULACIÓN] Obteniendo canción:', id);
      return null;
    }

    try {
      const result = await this.contract.evaluateTransaction('obtenerCancion', id);
      const cancionData = JSON.parse(result.toString());
      return cancionData;
    } catch (error) {
      console.error('Error obteniendo canción:', error.message);
      return null;
    }
  }

  /**
   * Obtiene un contrato desde la blockchain
   */
  async obtenerContrato(id) {
    if (this._modoSimulacion) {
      console.log('[SIMULACIÓN] Obteniendo contrato:', id);
      return null;
    }

    try {
      const result = await this.contract.evaluateTransaction('obtenerContrato', id);
      const contratoData = JSON.parse(result.toString());
      return contratoData;
    } catch (error) {
      console.error('Error obteniendo contrato:', error.message);
      return null;
    }
  }

  /**
   * Genera una clave de acceso para una canción
   */
  async generarClaveAcceso(cancionId) {
    const clave = ClaveAcceso.generar(cancionId);
    
    if (!this._modoSimulacion) {
      try {
        await this.contract.submitTransaction('generarClaveAcceso', cancionId, clave.valor);
      } catch (error) {
        console.error('Error generando clave en blockchain:', error.message);
      }
    }

    this._claveCache.set(cancionId, clave);
    return clave;
  }

  /**
   * Valida una clave de acceso
   */
  async validarClaveAcceso(cancionId, clave) {
    // Verificar en cache local primero
    if (this._claveCache.has(cancionId)) {
      const claveGuardada = this._claveCache.get(cancionId);
      if (claveGuardada.validar(clave)) {
        claveGuardada.marcarComoUsada();
        return true;
      }
    }

    // Verificar en blockchain
    if (!this._modoSimulacion) {
      try {
        const result = await this.contract.evaluateTransaction('validarClaveAcceso', cancionId, clave);
        return result.toString() === 'true';
      } catch (error) {
        console.error('Error validando clave:', error.message);
        return false;
      }
    }

    return false;
  }

  /**
   * Cierra la conexión con la blockchain
   */
  async desconectar() {
    if (this.gateway) {
      await this.gateway.disconnect();
      console.log('Conexión con blockchain cerrada');
    }
  }
}

module.exports = HyperledgerFabricService;
