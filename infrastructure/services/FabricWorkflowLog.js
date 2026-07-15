'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Registro de flujos relevantes (Fabric / negocio blockchain).
 * Archivo legible para demos: logs/fabric-workflow.log
 */
class FabricWorkflowLog {
  constructor(logPath) {
    const root = path.resolve(__dirname, '../..');
    this.logPath = logPath || path.join(root, 'logs', 'fabric-workflow.log');
    this._ensure();
  }

  _ensure() {
    const dir = path.dirname(this.logPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this.logPath)) {
      fs.writeFileSync(
        this.logPath,
        `# Music Royalty — Registro de flujos Fabric / Blockchain\n` +
          `# Archivo: ${this.logPath}\n` +
          `# Cada bloque documenta un flujo de negocio relevante.\n\n`,
        'utf8'
      );
    }
  }

  _now() {
    return new Date().toISOString();
  }

  _append(text) {
    this._ensure();
    fs.appendFileSync(this.logPath, text, 'utf8');
  }

  /**
   * Inicia un bloque de flujo (devuelve id para cerrar con endFlow).
   * @param {string} nombre  p.ej. PUBLICAR_CANCION, COMPRA_Y_REGALIAS
   * @param {object} [meta]
   */
  beginFlow(nombre, meta = {}) {
    const id = `${nombre}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const lines = [
      '',
      '================================================================================',
      `[${this._now()}] FLUJO: ${nombre}`,
      `  id: ${id}`
    ];
    for (const [k, v] of Object.entries(meta)) {
      if (v === undefined || v === null) continue;
      const val = typeof v === 'object' ? JSON.stringify(v) : String(v);
      lines.push(`  ${k}: ${val}`);
    }
    lines.push('--------------------------------------------------------------------------------');
    this._append(`${lines.join('\n')}\n`);
    return id;
  }

  /**
   * Paso dentro de un flujo.
   * @param {string} flowId
   * @param {string} paso  etiqueta corta
   * @param {'OK'|'ERROR'|'INFO'|'SKIP'} estado
   * @param {string} [detalle]
   */
  step(flowId, paso, estado = 'INFO', detalle = '') {
    const det = detalle ? `  ${detalle}` : '';
    this._append(
      `  [${this._now()}]  PASO  ${String(estado).padEnd(5)}  ${paso}${det}  (flow=${flowId})\n`
    );
  }

  endFlow(flowId, resultado = 'COMPLETADO', resumen = '') {
    const extra = resumen ? `\n  resumen: ${resumen}` : '';
    this._append(
      `--------------------------------------------------------------------------------\n` +
        `  [${this._now()}] FIN FLUJO  ${resultado}${extra}  (flow=${flowId})\n` +
        `================================================================================\n\n`
    );
  }

  /** Evento suelto (conexión, seed, enroll) sin bloque largo */
  event(categoria, mensaje, datos = {}) {
    const parts = Object.entries(datos)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join(' | ');
    this._append(
      `[${this._now()}] EVENTO  [${categoria}]  ${mensaje}${parts ? `  |  ${parts}` : ''}\n`
    );
  }

  /** Últimas N líneas para mostrar en UI / API */
  tail(maxLines = 200) {
    this._ensure();
    const raw = fs.readFileSync(this.logPath, 'utf8');
    const lines = raw.split(/\r?\n/);
    return lines.slice(Math.max(0, lines.length - maxLines)).join('\n');
  }

  get path() {
    return this.logPath;
  }
}

const fabricWorkflowLog = new FabricWorkflowLog();

module.exports = fabricWorkflowLog;
module.exports.FabricWorkflowLog = FabricWorkflowLog;
