/**
 * Entidad: Usuario
 * Representa un usuario en el sistema (artista, productor, etc.)
 */
class Usuario {
  constructor(id, nombre, email, rol) {
    this._id = id;
    this._nombre = nombre;
    this._email = email;
    this._rol = rol; // 'artista', 'productor', 'ingeniero', 'compositor', etc.
    this._fechaRegistro = new Date().toISOString();
    this._activo = true;
  }

  // Getters
  get id() { return this._id; }
  get nombre() { return this._nombre; }
  get email() { return this._email; }
  get rol() { return this._rol; }
  get fechaRegistro() { return this._fechaRegistro; }
  get activo() { return this._activo; }

  // Methods
  desactivar() {
    this._activo = false;
  }

  toPlainObject() {
    return {
      id: this._id,
      nombre: this._nombre,
      email: this._email,
      rol: this._rol,
      fechaRegistro: this._fechaRegistro,
      activo: this._activo
    };
  }

  static fromPlainObject(obj) {
    const usuario = new Usuario(obj.id, obj.nombre, obj.email, obj.rol);
    usuario._fechaRegistro = obj.fechaRegistro;
    usuario._activo = obj.activo;
    return usuario;
  }
}

module.exports = Usuario;
