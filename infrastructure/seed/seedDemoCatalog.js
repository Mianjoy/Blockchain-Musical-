'use strict';

/**
 * Catálogo demo: usuarios @ ficticios (misma red) + canciones comprables.
 * Se ejecuta si el catálogo está vacío (SEED_DEMO!=='false').
 */

const fabricLog = require('../services/FabricWorkflowLog');

const DEMO_PASSWORD = 'demo1234';

const DEMO_USERS = [
  { nickname: '@luna_beats', role: 'artista' },
  { nickname: '@marco_prod', role: 'productor' },
  { nickname: '@sofia_lyrics', role: 'compositor' },
  { nickname: '@dj_nova', role: 'artista' },
  { nickname: '@echo_label', role: 'sello' },
  { nickname: '@riley_mix', role: 'ingeniero' }
];

const DEMO_SONGS = [
  {
    titulo: 'Neon Horizon',
    artista: 'Luna Beats',
    linkArchivo: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    precio: 4.99,
    usuarioId: '@luna_beats',
    participantes: [
      { nombre: '@luna_beats', rol: 'artista', porcentaje: 50 },
      { nombre: '@marco_prod', rol: 'productor', porcentaje: 30 },
      { nombre: '@sofia_lyrics', rol: 'compositor', porcentaje: 20 }
    ]
  },
  {
    titulo: 'Midnight Circuit',
    artista: 'DJ Nova',
    linkArchivo: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    precio: 6.5,
    usuarioId: '@dj_nova',
    participantes: [
      { nombre: '@dj_nova', rol: 'artista', porcentaje: 55 },
      { nombre: '@riley_mix', rol: 'ingeniero', porcentaje: 25 },
      { nombre: '@echo_label', rol: 'sello', porcentaje: 20 }
    ]
  },
  {
    titulo: 'Coral Waves',
    artista: 'Luna Beats ft. Sofia',
    linkArchivo: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    precio: 3.5,
    usuarioId: '@luna_beats',
    participantes: [
      { nombre: '@luna_beats', rol: 'artista', porcentaje: 40 },
      { nombre: '@sofia_lyrics', rol: 'compositor', porcentaje: 35 },
      { nombre: '@marco_prod', rol: 'productor', porcentaje: 25 }
    ]
  },
  {
    titulo: 'Factory Anthem',
    artista: 'Echo Label Artists',
    linkArchivo: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    precio: 9.99,
    usuarioId: '@echo_label',
    participantes: [
      { nombre: '@echo_label', rol: 'sello', porcentaje: 30 },
      { nombre: '@dj_nova', rol: 'artista', porcentaje: 35 },
      { nombre: '@riley_mix', rol: 'ingeniero', porcentaje: 20 },
      { nombre: '@marco_prod', rol: 'productor', porcentaje: 15 }
    ]
  },
  {
    titulo: 'Soft Ledger',
    artista: 'Sofia Lyrics',
    linkArchivo: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    precio: 2.99,
    usuarioId: '@sofia_lyrics',
    participantes: [
      { nombre: '@sofia_lyrics', rol: 'compositor', porcentaje: 70 },
      { nombre: '@luna_beats', rol: 'artista', porcentaje: 30 }
    ]
  }
];

/**
 * @param {object} deps
 * @param {import('./UserAuthStore')} deps.authStore
 * @param {object} deps.crearCancionUseCase
 * @param {object} deps.cancionRepository
 * @param {object} [deps.notificationStore]
 * @param {boolean} [deps.force]
 */
async function seedDemoCatalog({
  authStore,
  crearCancionUseCase,
  cancionRepository,
  notificationStore = null,
  force = false
}) {
  if (process.env.SEED_DEMO === 'false') {
    console.log('[SEED] Desactivado (SEED_DEMO=false)');
    fabricLog.event('SEED', 'Catálogo demo desactivado');
    return { skipped: true, reason: 'disabled' };
  }

  const flowId = fabricLog.beginFlow('SEED_CATALOGO_DEMO', {
    force: !!force
  });

  const existentes = await cancionRepository.obtenerTodas();
  const titulosExistentes = new Set(
    existentes.map((c) => String(c.titulo || c.title || '').toLowerCase())
  );

  if (!force && existentes.length > 0) {
    // Si ya hay canciones pero faltan las demo, complemente solo las faltantes
    const faltanDemo = DEMO_SONGS.some(
      (s) => !titulosExistentes.has(s.titulo.toLowerCase())
    );
    if (!faltanDemo) {
      console.log(`[SEED] Catálogo demo ya presente (${existentes.length} canción(es))`);
      for (const u of DEMO_USERS) {
        try {
          if (!authStore.exists(u.nickname)) {
            await authStore.register(u.nickname, DEMO_PASSWORD);
          }
        } catch (_) {
          /* ignore */
        }
      }
      fabricLog.step(flowId, 'SKIP', 'SKIP', 'demo ya presente');
      fabricLog.endFlow(flowId, 'OMITIDO', `cancionesExistentes=${existentes.length}`);
      return { skipped: true, reason: 'demo-present', count: existentes.length };
    }
  }

  console.log('[SEED] Creando usuarios ficticios de la red...');
  fabricLog.step(flowId, '1_USUARIOS_DEMO', 'INFO', 'registrando @nicks ficticios');
  const usersOk = [];
  for (const u of DEMO_USERS) {
    try {
      if (authStore.exists(u.nickname)) {
        usersOk.push(u.nickname);
        continue;
      }
      await authStore.register(u.nickname, DEMO_PASSWORD);
      usersOk.push(u.nickname);
    } catch (err) {
      if (/ya está registrado/i.test(err.message)) {
        usersOk.push(u.nickname);
      } else {
        console.warn(`[SEED] Usuario ${u.nickname}: ${err.message}`);
      }
    }
  }

  console.log('[SEED] Publicando canciones demo en el ledger/catálogo...');
  const created = [];
  for (const song of DEMO_SONGS) {
    if (!force && titulosExistentes.has(song.titulo.toLowerCase())) {
      continue;
    }
    if (force && titulosExistentes.has(song.titulo.toLowerCase())) {
      continue; // no duplicar por título
    }
    try {
      const resultado = await crearCancionUseCase.execute({
        titulo: song.titulo,
        artista: song.artista,
        linkArchivo: song.linkArchivo,
        precio: song.precio,
        usuarioId: song.usuarioId,
        participantes: song.participantes
      });

      created.push(resultado.cancion?.id || song.titulo);
      titulosExistentes.add(song.titulo.toLowerCase());

      if (notificationStore) {
        notificationStore.publicar({
          tipo: 'lanzamiento',
          titulo: 'Nuevo lanzamiento',
          mensaje: `"${song.titulo}" de ${song.artista} ya está disponible en el catálogo`,
          payload: {
            cancionId: resultado.cancion?.id,
            titulo: song.titulo,
            artista: song.artista,
            precio: song.precio,
            demo: true
          }
        });
      }
    } catch (err) {
      console.warn(`[SEED] Canción "${song.titulo}": ${err.message}`);
    }
  }

  console.log('[SEED] Listo.');
  console.log(`[SEED] Usuarios demo (password: ${DEMO_PASSWORD}): ${usersOk.join(', ')}`);
  console.log(`[SEED] Canciones creadas: ${created.length}`);

  fabricLog.step(
    flowId,
    '2_CANCIONES_DEMO',
    'OK',
    `creadas=${created.length} usuarios=${usersOk.join(',')}`
  );
  fabricLog.endFlow(flowId, 'COMPLETADO', `songs=${created.length}`);

  return {
    skipped: false,
    users: usersOk,
    password: DEMO_PASSWORD,
    songs: created
  };
}

module.exports = {
  seedDemoCatalog,
  DEMO_USERS,
  DEMO_SONGS,
  DEMO_PASSWORD
};
