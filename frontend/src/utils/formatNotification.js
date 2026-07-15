/**
 * Traduce título/mensaje de notificaciones según tipo + payload.
 * El backend guarda textos en español; la UI debe i18nizar al renderizar.
 */
export function formatNotification(n, t) {
  const payload = n?.payload || {};
  const tituloCancion = payload.titulo || payload.title || '';
  const artista = payload.artista || payload.artist || '';

  if (n?.tipo === 'lanzamiento') {
    return {
      title: t('notifications.release.title'),
      message: t('notifications.release.message', {
        title: tituloCancion,
        artist: artista
      })
    };
  }

  if (n?.tipo === 'venta') {
    return {
      title: t('notifications.sale.title'),
      message: t('notifications.sale.message', {
        title: tituloCancion || payload.cancionId || ''
      })
    };
  }

  return {
    title: n?.titulo || t('notifications.title'),
    message: n?.mensaje || ''
  };
}
