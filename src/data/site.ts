/**
 * LUCKY LOSERS — fuente única de contenido del sitio.
 *
 * Todo el texto, las fotos, los tracks, las fechas y los links salen de acá.
 * Los componentes no deben hardcodear contenido.
 *
 * Convención: `null` = dato real pendiente (marcado con `TODO(contenido)`).
 * Nunca reemplazar un `null` por un dato inventado: el sitio sabe mostrar
 * el estado pendiente, y `npm run build` imprime la lista de pendientes.
 * Guía de edición: ver README → "Gestión de contenido".
 */
import type { SiteData } from '@/types/content';

import photoStage from '@/assets/photos/foto0-estela-cantante.jpg';
import photoGuitar from '@/assets/photos/foto1-guitarra-remera-blanca.jpg';
import photoBassDrums from '@/assets/photos/foto2-bajista-baterista.jpg';
import photoSinger from '@/assets/photos/foto3-cantante.jpg';
import photoCrowd from '@/assets/photos/foto4-publico.jpg';

export const siteData: SiteData = {
  meta: {
    title: 'LUCKY LOSERS',
    description: 'Ruido, melodía y derrota. Lucky Losers.',
    lang: 'es-AR',
    ogLocale: 'es_AR',
    ogTitle: 'LUCKY LOSERS',
    ogDescription: 'Perdedores con suerte. Volumen alto.',
    themeColor: '#1A0303',
    keywords: ['Lucky Losers', 'banda', 'rock', 'noise pop', 'feedback'],
  },

  band: {
    name: 'Lucky Losers',
    nameParts: ['Lucky', 'Losers'],
    shortName: 'LL',
    tagline: 'Ganar es aburrido.',
    taglines: [
      'Todo mal. Todo bien.',
      'Feedback y nada más.',
      'Perder también es un arte.',
      'Turn it up. Después, nada.',
    ],
    statement: 'Una derrota que suena a victoria.',
    bio: 'Ruido. Melodía escondida. Una derrota que suena a victoria. Lucky Losers no explica: suena.',
    // TODO(contenido): formación, ciudad, año, historia.
    bioExtended: null,
    // TODO(contenido): ciudad de la banda (se muestra como metadata y en JSON-LD).
    city: null,
    // TODO(contenido): género confirmado por la banda (p. ej. "noise pop").
    genre: null,
    // TODO(contenido): año de formación.
    foundedYear: null,
    closingLine: 'Turn it up.',
  },

  navigation: [
    { label: 'Banda', target: 'banda' },
    { label: 'Música', target: 'musica' },
    { label: 'Shows', target: 'shows' },
    { label: 'Contacto', target: 'contacto' },
  ],

  sections: {
    band: { index: '01', title: 'Quiénes', intro: 'Perdedores con suerte.' },
    archive: { index: '02', title: 'Archivo', intro: 'Una noche, un sótano, volumen excesivo.' },
    music: { index: '03', title: 'Música', intro: 'Escuchá fuerte.' },
    shows: { index: '04', title: 'Shows', intro: 'Vení. O no.' },
    contact: { index: '05', title: 'Contacto', intro: 'Escribinos. Quizás respondamos.' },
  },

  photos: {
    hero: {
      id: 'escenario',
      src: photoStage,
      alt: 'Lucky Losers tocando en vivo bajo luz roja: el guitarrista en primer plano con una estela de luz cruzando la imagen, la banda detrás.',
      caption: 'Estela',
      focus: '50% 35%',
      // TODO(contenido): año, lugar y crédito fotográfico.
      year: null,
      location: null,
      credit: null,
    },
    band: {
      id: 'guitarra',
      src: photoGuitar,
      alt: 'Guitarrista de pelo largo y remera blanca tocando una guitarra roja en un cuarto iluminado de rojo.',
      caption: 'Guitarra, remera blanca',
      focus: '55% 40%',
      year: null,
      location: null,
      credit: null,
    },
    archive: [
      {
        id: 'cantante',
        src: photoSinger,
        alt: 'El cantante gritando con la guitarra en alto, la batería y afiches pegados en la pared detrás.',
        caption: 'Cantante',
        focus: '45% 45%',
        year: null,
        location: null,
        credit: null,
      },
      {
        id: 'bajo-bateria',
        src: photoBassDrums,
        alt: 'El bajista inclinado sobre su bajo y el baterista detrás, con una línea de luz roja en movimiento.',
        caption: 'Bajo y batería',
        focus: '50% 50%',
        year: null,
        location: null,
        credit: null,
      },
      {
        id: 'publico',
        src: photoCrowd,
        alt: 'Vista desde atrás del público apretado en una sala con techo de madera, mirando a la banda tocar al fondo.',
        caption: 'Público',
        focus: '50% 55%',
        year: null,
        location: null,
        credit: null,
      },
    ],
  },

  // Duraciones medidas de los archivos (afinfo). Si se reemplaza un MP3,
  // actualizar `durationSeconds`.
  tracks: [
    {
      id: 'track-01',
      // TODO(contenido): título real del track 1.
      title: 'Pista uno',
      src: '/audio/track1.mp3',
      durationSeconds: 163,
      year: null,
      link: null,
    },
    {
      id: 'track-02',
      // TODO(contenido): título real del track 2.
      title: 'Pista dos',
      src: '/audio/track2.mp3',
      durationSeconds: 192,
      year: null,
      link: null,
    },
    {
      id: 'track-03',
      // TODO(contenido): título real del track 3.
      title: 'Pista tres',
      src: '/audio/track3.mp3',
      durationSeconds: 254,
      year: null,
      link: null,
    },
  ],

  // TODO(contenido): cargar fechas reales. Formato:
  // { id: '2026-11-14-caba', date: '2026-11-14', city: 'Ciudad', venue: 'Lugar',
  //   ticketUrl: 'https://…' | null, status: 'available' | 'sold-out' | 'free' | 'tba' }
  // Las fechas pasadas se muestran tachadas automáticamente.
  shows: [],
  showsEmpty: { title: 'Sin fechas. Por ahora.', subtitle: 'Volvemos con ruido.' },

  contact: {
    // TODO(contenido): emails reales.
    email: null,
    booking: null,
    press: null,
  },
  contactCopy: { cta: 'Escribinos' },

  // TODO(contenido): URLs reales de cada red. Las que queden en `null`
  // se muestran como "pronto", sin link.
  socialLinks: [
    { id: 'instagram', label: 'Instagram', href: null },
    { id: 'spotify', label: 'Spotify', href: null },
    { id: 'bandcamp', label: 'Bandcamp', href: null },
    { id: 'youtube', label: 'YouTube', href: null },
  ],
};
