/**
 * Interfaz: IContratoRepository
 * Define el contrato para el repositorio de contratos
 */
class IContratoRepository {
  async guardar(contrato) {
    throw new Error('Método no implementado');
  }

  async obtenerPorId(id) {
    throw new Error('Método no implementado');
  }

  async obtenerPorCancionId(cancionId) {
    throw new Error('Método no implementado');
  }

  async obtenerTodos() {
    throw new Error('Método no implementado');
  }

  async actualizar(contrato) {
    throw new Error('Método no implementado');
  }
}

module.exports = IContratoRepository;
