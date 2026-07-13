/**
 * Genera reportes de analytics y regalías a partir de canciones + contratos.
 */
class AnalyticsService {
  /**
   * @param {object} cancionRepository
   * @param {object} contratoRepository
   */
  constructor(cancionRepository, contratoRepository) {
    this.cancionRepository = cancionRepository;
    this.contratoRepository = contratoRepository;
  }

  async generarReporte() {
    const canciones = await this.cancionRepository.obtenerTodas();
    const contratos = await this.contratoRepository.obtenerTodos();

    const cancionMap = new Map(canciones.map((c) => [c.id, c]));
    const porCancion = [];
    const porBeneficiario = new Map();
    const timeline = [];

    let totalVentas = 0;
    let totalTransacciones = 0;
    let totalRegalías = 0;

    for (const contrato of contratos) {
      const cancion = cancionMap.get(contrato.cancionId);
      const txs = Array.isArray(contrato.transacciones) ? contrato.transacciones : [];
      let ventasCancion = 0;
      let ingresosCancion = 0;
      const distribucionAcumulada = {};

      for (const tx of txs) {
        const monto = Number(tx.monto) || 0;
        totalTransacciones += 1;
        totalVentas += monto;
        ventasCancion += 1;
        ingresosCancion += monto;

        timeline.push({
          fecha: tx.fecha,
          cancionId: contrato.cancionId,
          titulo: cancion?.titulo || contrato.cancionId,
          artista: cancion?.artista || '—',
          monto,
          compradorId: tx.compradorId,
          transaccionId: tx.id
        });

        const dist = Array.isArray(tx.distribucion) ? tx.distribucion : [];
        for (const d of dist) {
          const nombre = d.nombre || d.name || 'Sin nombre';
          const rol = d.rol || d.role || '—';
          const parte = Number(d.monto) || 0;
          totalRegalías += parte;

          const key = `${nombre}::${rol}`;
          const prev = porBeneficiario.get(key) || {
            nombre,
            rol,
            montoTotal: 0,
            transacciones: 0,
            canciones: new Set()
          };
          prev.montoTotal += parte;
          prev.transacciones += 1;
          prev.canciones.add(contrato.cancionId);
          porBeneficiario.set(key, prev);

          distribucionAcumulada[nombre] = (distribucionAcumulada[nombre] || 0) + parte;
        }
      }

      porCancion.push({
        cancionId: contrato.cancionId,
        titulo: cancion?.titulo || 'Canción',
        artista: cancion?.artista || '—',
        ventas: ventasCancion,
        ingresos: ingresosCancion,
        participantes: contrato.participantes || cancion?.participantes || [],
        distribucionAcumulada
      });
    }

    // Canciones sin contrato aún aparecen con ceros
    for (const c of canciones) {
      if (!porCancion.find((p) => p.cancionId === c.id)) {
        porCancion.push({
          cancionId: c.id,
          titulo: c.titulo,
          artista: c.artista,
          ventas: 0,
          ingresos: 0,
          participantes: c.participantes || [],
          distribucionAcumulada: {}
        });
      }
    }

    timeline.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const beneficiarios = Array.from(porBeneficiario.values())
      .map((b) => ({
        nombre: b.nombre,
        rol: b.rol,
        montoTotal: Number(b.montoTotal.toFixed(2)),
        transacciones: b.transacciones,
        canciones: b.canciones.size
      }))
      .sort((a, b) => b.montoTotal - a.montoTotal);

    porCancion.sort((a, b) => b.ingresos - a.ingresos);

    return {
      resumen: {
        totalCanciones: canciones.length,
        totalContratos: contratos.length,
        totalTransacciones,
        totalVentas: Number(totalVentas.toFixed(2)),
        totalRegalías: Number(totalRegalías.toFixed(2)),
        ticketPromedio:
          totalTransacciones > 0
            ? Number((totalVentas / totalTransacciones).toFixed(2))
            : 0
      },
      porCancion: porCancion.map((p) => ({
        ...p,
        ingresos: Number(p.ingresos.toFixed(2))
      })),
      porBeneficiario: beneficiarios,
      timeline: timeline.slice(0, 50),
      generadoEn: new Date().toISOString()
    };
  }
}

module.exports = AnalyticsService;
