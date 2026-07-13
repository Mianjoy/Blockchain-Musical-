import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiService from '../services/api';
import '../styles/AnalyticsPage.css';

const money = (n) =>
  Number(n || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' });

const AnalyticsPage = () => {
  const { t } = useTranslation();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await apiService.getAnalytics();
        if (alive) setReport(data);
      } catch (err) {
        if (alive) setError(err.message || t('common.error'));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [t]);

  if (loading) {
    return <div className="analytics-page loading-state">{t('common.loading')}</div>;
  }

  if (error) {
    return <div className="analytics-page error-state">{error}</div>;
  }

  const resumen = report?.resumen || {};

  return (
    <div className="analytics-page">
      <header className="analytics-header">
        <div>
          <p className="analytics-kicker">{t('analytics.kicker')}</p>
          <h1>{t('analytics.title')}</h1>
          <p className="analytics-sub">{t('analytics.subtitle')}</p>
        </div>
        <p className="analytics-generated">
          {t('analytics.generated')}: {new Date(report?.generadoEn || Date.now()).toLocaleString()}
        </p>
      </header>

      <section className="analytics-kpis">
        <article className="kpi">
          <span>{t('analytics.kpi.songs')}</span>
          <strong>{resumen.totalCanciones || 0}</strong>
        </article>
        <article className="kpi">
          <span>{t('analytics.kpi.sales')}</span>
          <strong>{resumen.totalTransacciones || 0}</strong>
        </article>
        <article className="kpi kpi-accent">
          <span>{t('analytics.kpi.revenue')}</span>
          <strong>{money(resumen.totalVentas)}</strong>
        </article>
        <article className="kpi">
          <span>{t('analytics.kpi.royalties')}</span>
          <strong>{money(resumen.totalRegalías)}</strong>
        </article>
        <article className="kpi">
          <span>{t('analytics.kpi.avgTicket')}</span>
          <strong>{money(resumen.ticketPromedio)}</strong>
        </article>
      </section>

      <div className="analytics-grid">
        <section className="analytics-panel">
          <h2>{t('analytics.bySong')}</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t('analytics.col.song')}</th>
                  <th>{t('analytics.col.artist')}</th>
                  <th>{t('analytics.col.sales')}</th>
                  <th>{t('analytics.col.income')}</th>
                </tr>
              </thead>
              <tbody>
                {(report?.porCancion || []).length === 0 ? (
                  <tr>
                    <td colSpan="4">{t('analytics.empty')}</td>
                  </tr>
                ) : (
                  report.porCancion.map((row) => (
                    <tr key={row.cancionId}>
                      <td>{row.titulo}</td>
                      <td>{row.artista}</td>
                      <td>{row.ventas}</td>
                      <td>{money(row.ingresos)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="analytics-panel">
          <h2>{t('analytics.byBeneficiary')}</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t('analytics.col.name')}</th>
                  <th>{t('analytics.col.role')}</th>
                  <th>{t('analytics.col.royalties')}</th>
                  <th>{t('analytics.col.txs')}</th>
                </tr>
              </thead>
              <tbody>
                {(report?.porBeneficiario || []).length === 0 ? (
                  <tr>
                    <td colSpan="4">{t('analytics.empty')}</td>
                  </tr>
                ) : (
                  report.porBeneficiario.map((row, idx) => (
                    <tr key={`${row.nombre}-${row.rol}-${idx}`}>
                      <td>{row.nombre}</td>
                      <td>{row.rol}</td>
                      <td>{money(row.montoTotal)}</td>
                      <td>{row.transacciones}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="analytics-panel analytics-timeline">
        <h2>{t('analytics.timeline')}</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('analytics.col.date')}</th>
                <th>{t('analytics.col.song')}</th>
                <th>{t('analytics.col.buyer')}</th>
                <th>{t('analytics.col.amount')}</th>
              </tr>
            </thead>
            <tbody>
              {(report?.timeline || []).length === 0 ? (
                <tr>
                  <td colSpan="4">{t('analytics.empty')}</td>
                </tr>
              ) : (
                report.timeline.map((row) => (
                  <tr key={row.transaccionId}>
                    <td>{row.fecha ? new Date(row.fecha).toLocaleString() : '—'}</td>
                    <td>
                      {row.titulo}
                      <small>{row.artista}</small>
                    </td>
                    <td>{row.compradorId}</td>
                    <td>{money(row.monto)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AnalyticsPage;
