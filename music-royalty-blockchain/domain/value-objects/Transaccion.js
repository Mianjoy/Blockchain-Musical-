/**
 * Value Object: Transaccion
 * Representa una transacción de pago en el sistema
 */
class Transaccion {
  constructor(id, contratoId, monto, compradorId, fecha) {
    this._id = id;
    this._contratoId = contratoId;
    this._monto = monto;
    this._compradorId = compradorId;
    this._fecha = fecha || new Date().toISOString();
    this._distribucion = [];
  }

  // Getters
  get id() { return this._id; }
  get contratoId() { return this._contratoId; }
  get monto() { return this._monto; }
  get compradorId() { return this._compradorId; }
  get fecha() { return this._fecha; }
  get distribucion() { return [...this._distribucion]; }

  // Methods
  registrarDistribucion(distribucion) {
    if (this._distribucion.length > 0) {
      throw new Error('La distribución ya ha sido registrada');
    }
    this._distribucion = distribucion;
  }

  toPlainObject() {
    return {
      id: this._id,
      contratoId: this._contratoId,
      monto: this._monto,
      compradorId: this._compradorId,
      fecha: this._fecha,
      distribucion: this._distribucion
    };
  }

  static fromPlainObject(obj) {
    const transaccion = new Transaccion(
      obj.id,
      obj.contratoId,
      obj.monto,
      obj.compradorId,
      obj.fecha
    );
    if (obj.distribucion) {
      transaccion._distribucion = obj.distribucion;
    }
    return transaccion;
  }
}

module.exports = Transaccion;
