/**
 * Interfaz: IBlockchainService
 * Define el contrato para el servicio de blockchain
 */
class IBlockchainService {
  async inicializar() {
    throw new Error('Método no implementado');
  }

  async registrarCancion(cancion) {
    throw new Error('Método no implementado');
  }

  async actualizarCancion(cancion) {
    throw new Error('Método no implementado');
  }

  async registrarContrato(contrato) {
    throw new Error('Método no implementado');
  }

  async actualizarContrato(contrato) {
    throw new Error('Método no implementado');
  }

  async registrarTransaccion(transaccion) {
    throw new Error('Método no implementado');
  }

  async obtenerCancion(id) {
    throw new Error('Método no implementado');
  }

  async obtenerTodasLasCanciones() {
    throw new Error('Método no implementado');
  }

  async obtenerContrato(id) {
    throw new Error('Método no implementado');
  }

  async obtenerContratoPorCancion(cancionId) {
    throw new Error('Método no implementado');
  }

  async generarClaveAcceso(cancionId) {
    throw new Error('Método no implementado');
  }

  async validarClaveAcceso(cancionId, clave) {
    throw new Error('Método no implementado');
  }
}

module.exports = IBlockchainService;
