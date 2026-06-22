const Contrato = require('../../domain/entities/Contrato');
const IContratoRepository = require('../../domain/interfaces/IContratoRepository');

/**
 * Implementación del repositorio de contratos usando Hyperledger Fabric
 */
class BlockchainContratoRepository extends IContratoRepository {
  constructor(blockchainService) {
    super();
    this.blockchainService = blockchainService;
    this._cache = new Map();
  }

  async guardar(contrato) {
    if (!(contrato instanceof Contrato)) {
      throw new Error('El objeto debe ser una instancia de Contrato');
    }

    // Guardar en cache local
    this._cache.set(contrato.id, contrato);

    // Registrar en blockchain
    await this.blockchainService.registrarContrato(contrato);

    return contrato;
  }

  async obtenerPorId(id) {
    if (this._cache.has(id)) {
      return this._cache.get(id);
    }

    try {
      const contratoData = await this.blockchainService.obtenerContrato(id);
      if (contratoData) {
        const contrato = Contrato.fromPlainObject(contratoData);
        this._cache.set(id, contrato);
        return contrato;
      }
    } catch (error) {
      console.error(`Error obteniendo contrato ${id}:`, error.message);
    }

    return null;
  }

  async obtenerPorCancionId(cancionId) {
    // Buscar en cache por cancionId
    for (const [key, value] of this._cache.entries()) {
      if (value.cancionId === cancionId) {
        return value;
      }
    }

    // Intentar obtener de blockchain (se asume que hay un método para esto)
    try {
      const contratos = await this.obtenerTodos();
      const contrato = contratos.find(c => c.cancionId === cancionId);
      if (contrato) {
        const contratoEntity = Contrato.fromPlainObject(contrato);
        this._cache.set(contrato.id, contratoEntity);
        return contratoEntity;
      }
    } catch (error) {
      console.error(`Error obteniendo contrato por canción ${cancionId}:`, error.message);
    }

    return null;
  }

  async obtenerTodos() {
    return Array.from(this._cache.values()).map(c => c.toPlainObject());
  }

  async actualizar(contrato) {
    if (!(contrato instanceof Contrato)) {
      throw new Error('El objeto debe ser una instancia de Contrato');
    }

    // Actualizar en cache
    this._cache.set(contrato.id, contrato);

    // Actualizar en blockchain
    await this.blockchainService.registrarContrato(contrato);

    return contrato;
  }
}

module.exports = BlockchainContratoRepository;
