'use strict';

const { validateNickname, normalizeNickname } = require('../../domain/utils/nickname');

/**
 * Lista las compras de un comprador (@nickname) a partir de contratos + canciones.
 */
class ObtenerComprasUsuarioUseCase {
  /**
   * @param {object} cancionRepository
   * @param {object} contratoRepository
   */
  constructor(cancionRepository, contratoRepository) {
    this.cancionRepository = cancionRepository;
    this.contratoRepository = contratoRepository;
  }

  async execute({ compradorId }) {
    const nick = validateNickname(compradorId);
    if (!nick.ok) {
      throw new Error(nick.error);
    }

    const canciones = await this.cancionRepository.obtenerTodas();
    const contratos = await this.contratoRepository.obtenerTodos();
    const cancionMap = new Map(canciones.map((c) => [c.id, c]));
    const compras = [];
    const seen = new Set();

    for (const contrato of contratos) {
      const txs = Array.isArray(contrato.transacciones) ? contrato.transacciones : [];
      const cancion = cancionMap.get(contrato.cancionId);

      for (const tx of txs) {
        if (!tx || !tx.id) continue;
        if (seen.has(tx.id)) continue;

        const buyer = normalizeNickname(tx.compradorId || '');
        if (buyer !== nick.nickname) continue;

        seen.add(tx.id);
        compras.push({
          id: tx.id,
          songId: contrato.cancionId,
          songTitle: cancion?.titulo || contrato.cancionId,
          artist: cancion?.artista || '—',
          date: tx.fecha || null,
          amount: Number(tx.monto) || 0,
          accessKey: cancion?.claveAcceso || null,
          url: cancion?.linkArchivo || null,
          compradorId: nick.nickname,
          distribucion: Array.isArray(tx.distribucion) ? tx.distribucion : []
        });
      }
    }

    compras.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });

    return compras;
  }
}

module.exports = ObtenerComprasUsuarioUseCase;
