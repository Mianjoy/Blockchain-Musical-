/**
 * Entidad: Contrato
 * Representa un contrato inteligente de regalías para una canción
 */
class Contrato {
  constructor(id, cancionId, participantes, fechaCreacion) {
    this._id = id;
    this._cancionId = cancionId;
    this._participantes = participantes; // Array de {usuarioId, rol, porcentaje}
    this._fechaCreacion = fechaCreacion;
    this._transacciones = [];
    this._activo = true;
  }

  // Getters
  get id() { return this._id; }
  get cancionId() { return this._cancionId; }
  get participantes() { return [...this._participantes]; }
  get fechaCreacion() { return this._fechaCreacion; }
  get transacciones() { return [...this._transacciones]; }
  get activo() { return this._activo; }

  // Methods
  registrarTransaccion(transaccion) {
    if (!this._activo) {
      throw new Error('El contrato no está activo');
    }
    this._transacciones.push(transaccion);
  }

  distribuirRegalias(montoTotal) {
    if (!this._activo) {
      throw new Error('El contrato no está activo');
    }

    const totalPorcentaje = this._participantes.reduce(
      (sum, p) => sum + Number(p.porcentaje),
      0
    );
    if (Math.abs(totalPorcentaje - 100) > 0.01) {
      throw new Error(`La suma de porcentajes debe ser 100%, actual: ${totalPorcentaje}%`);
    }

    return this._participantes.map(p => ({
      usuarioId: p.usuarioId,
      nombre: p.nombre,
      rol: p.rol,
      porcentaje: Number(p.porcentaje),
      monto: (montoTotal * Number(p.porcentaje)) / 100
    }));
  }

  desactivar() {
    this._activo = false;
  }

  toPlainObject() {
    return {
      id: this._id,
      cancionId: this._cancionId,
      participantes: this._participantes,
      fechaCreacion: this._fechaCreacion,
      transacciones: this._transacciones,
      activo: this._activo
    };
  }

  static fromPlainObject(obj) {
    const contrato = new Contrato(
      obj.id,
      obj.cancionId,
      obj.participantes,
      obj.fechaCreacion
    );
    contrato._transacciones = obj.transacciones || [];
    contrato._activo = obj.activo !== false;
    return contrato;
  }
}

module.exports = Contrato;
