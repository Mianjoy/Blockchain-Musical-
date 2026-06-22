/**
 * Interfaz: ICancionRepository
 * Define el contrato para el repositorio de canciones
 */
class ICancionRepository {
  /**
   * @throws {Error} Si no se implementa
   */
  async guardar(cancion) {
    throw new Error('Método no implementado');
  }

  async obtenerPorId(id) {
    throw new Error('Método no implementado');
  }

  async obtenerTodas() {
    throw new Error('Método no implementado');
  }

  async actualizar(cancion) {
    throw new Error('Método no implementado');
  }

  async eliminar(id) {
    throw new Error('Método no implementado');
  }
}

module.exports = ICancionRepository;
