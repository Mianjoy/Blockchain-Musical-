/**
 * Entidad: Cancion
 * Representa una canción en el sistema de regalías
 */
class Cancion {
  constructor(id, titulo, artista, linkArchivo, participantes, fechaCreacion) {
    this._id = id;
    this._titulo = titulo;
    this._artista = artista;
    this._linkArchivo = linkArchivo;
    this._participantes = participantes; // Array de {rol, nombre, porcentaje}
    this._fechaCreacion = fechaCreacion;
    this._claveAcceso = null;
    this._activa = true;
  }

  // Getters
  get id() { return this._id; }
  get titulo() { return this._titulo; }
  get artista() { return this._artista; }
  get linkArchivo() { return this._linkArchivo; }
  get participantes() { return [...this._participantes]; }
  get fechaCreacion() { return this._fechaCreacion; }
  get claveAcceso() { return this._claveAcceso; }
  get activa() { return this._activa; }

  // Methods
  generarClaveAcceso(clave) {
    if (this._claveAcceso) {
      throw new Error('La canción ya tiene una clave de acceso generada');
    }
    this._claveAcceso = clave;
  }

  desactivar() {
    this._activa = false;
  }

  validarParticipantes() {
    const totalPorcentaje = this._participantes.reduce((sum, p) => sum + p.porcentaje, 0);
    if (totalPorcentaje !== 100) {
      throw new Error(`La suma de porcentajes debe ser 100%, actual: ${totalPorcentaje}%`);
    }
    return true;
  }

  calcularRegalias(montoTotal) {
    return this._participantes.map(p => ({
      nombre: p.nombre,
      rol: p.rol,
      monto: (montoTotal * p.porcentaje) / 100
    }));
  }

  toPlainObject() {
    return {
      id: this._id,
      titulo: this._titulo,
      artista: this._artista,
      linkArchivo: this._linkArchivo,
      participantes: this._participantes,
      fechaCreacion: this._fechaCreacion,
      claveAcceso: this._claveAcceso,
      activa: this._activa
    };
  }

  static fromPlainObject(obj) {
    return new Cancion(
      obj.id,
      obj.titulo,
      obj.artista,
      obj.linkArchivo,
      obj.participantes,
      obj.fechaCreacion
    );
  }
}

module.exports = Cancion;
