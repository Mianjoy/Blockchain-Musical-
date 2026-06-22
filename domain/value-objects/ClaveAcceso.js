/**
 * Value Object: ClaveAcceso
 * Representa una clave de acceso generada por la blockchain
 */
const crypto = require('crypto-js');

class ClaveAcceso {
  constructor(cancionId, valor) {
    this._cancionId = cancionId;
    this._valor = valor;
    this._fechaGeneracion = new Date().toISOString();
    this._usada = false;
  }

  // Getters
  get cancionId() { return this._cancionId; }
  get valor() { return this._valor; }
  get fechaGeneracion() { return this._fechaGeneracion; }
  get usada() { return this._usada; }

  // Methods
  marcarComoUsada() {
    this._usada = true;
  }

  validar(claveIngresada) {
    return this._valor === claveIngresada && !this._usada;
  }

  toPlainObject() {
    return {
      cancionId: this._cancionId,
      valor: this._valor,
      fechaGeneracion: this._fechaGeneracion,
      usada: this._usada
    };
  }

  static fromPlainObject(obj) {
    const clave = new ClaveAcceso(obj.cancionId, obj.valor);
    clave._fechaGeneracion = obj.fechaGeneracion;
    clave._usada = obj.usada;
    return clave;
  }

  /**
   * Genera una clave única usando hash criptográfico
   */
  static generar(cancionId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString();
    const data = `${cancionId}-${timestamp}-${random}`;
    const hash = crypto.SHA256(data).toString().substring(0, 16);
    return new ClaveAcceso(cancionId, hash.toUpperCase());
  }
}

module.exports = ClaveAcceso;
