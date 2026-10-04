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
import type { FeaturedVideo, NavItem, PastShow, SiteData } from '@/types/content';

import photoStage from '@/assets/photos/foto0-estela-cantante.jpg';
import photoGuitar from '@/assets/photos/foto1-guitarra-remera-blanca.jpg';
import photoBassDrums from '@/assets/photos/foto2-bajista-baterista.jpg';
import photoSinger from '@/assets/photos/foto3-cantante.jpg';
import photoCrowd from '@/assets/photos/foto4-publico.jpg';
import tempestadPoster from '@/assets/video/tempestad-poster.jpg';

/**
 * Video destacado: Tempestad en vivo (archivo propio en public/video/).
 * Para usar YouTube en su lugar:
 *   { kind: 'youtube', title: 'Tempestad', videoId: 'ID_REAL_DEL_VIDEO' }
 * `null` → la sección Video no se renderiza y sale de la navegación.
 */
const featuredVideo: FeaturedVideo | null = {
  kind: 'local',
  title: 'Tempestad',
  sources: [{ src: '/video/tempestad.mp4', type: 'video/mp4' }],
  poster: tempestadPoster,
  width: 1280,
  height: 720,
};

/**
 * Archivo de conciertos ya realizados. Cada fecha lleva su flyer real:
 * 1. copiar la imagen a src/assets/flyers/ (p. ej. 2026-05-12-lugar.jpg);
 * 2. agregar un objeto acá. Ejemplo (formato, no datos reales):
 *    {
 *      id: '2026-05-12-lugar',
 *      date: '2026-05-12',
 *      venue: 'Nombre del lugar',
 *      city: 'Ciudad', // o null
 *      flyer: '2026-05-12-lugar.jpg', // nombre del archivo en src/assets/flyers/
 *      alt: 'Flyer: Lucky Losers en …, 12 de mayo, con …',
 *      bands: ['Otra banda'], // opcional
 *    },
 * Vacío → la sección En vivo no se renderiza.
 */
// Datos tomados de los flyers. Los flyers no traen el año: se dedujo por el
// día de la semana impreso (13/12 sábado → 2025; 29/08 sábado → 2026) y el
// orden de las fechas. TODO(contenido): ciudad de cada fecha.
const pastShows: PastShow[] = [
  {
    id: '2025-12-13-chilla-calavera',
    date: '2025-12-13',
    venue: 'Chilla Calavera',
    city: null,
    flyer: '2025-12-13-chilla-calavera.jpg',
    alt: 'Flyer del debut: Lucky Losers y Kimberly Drummond en Chilla Calavera, Alem 306, sábado 13 de diciembre a las 23:59, sobre una cancha de tenis con la red y una pelota.',
    bands: ['Kimberly Drummond'],
  },
  {
    id: '2026-04-18-patio-espiral',
    date: '2026-04-18',
    venue: 'Patio Espiral',
    city: null,
    flyer: '2026-04-18-patio-espiral.jpg',
    alt: 'Flyer: Lucky Losers, Poster Fantasi y Conciliados en Patio Espiral, 18 de abril a las 21. Letras rojas sobre la foto de un nene gritando en una cancha de bádminton.',
    bands: ['Poster Fantasi', 'Conciliados'],
  },
  {
    id: '2026-05-16-casa-del-pueblo',
    date: '2026-05-16',
    venue: 'Casa del Pueblo',
    city: null,
    flyer: '2026-05-16-casa-del-pueblo.jpg',
    alt: 'Flyer naranja: Lucky Losers, Ladrones, Muertos Hoy y Desierto Líquido en Casa del Pueblo, 16 de mayo a las 21:30, con una foto repetida en grilla y una estrella negra.',
    bands: ['Ladrones', 'Muertos Hoy', 'Desierto Líquido'],
  },
  {
    id: '2026-07-24-chilla-calavera',
    date: '2026-07-24',
    venue: 'Chilla Calavera',
    city: null,
    flyer: '2026-07-24-chilla-calavera.jpg',
    alt: 'Flyer rojo y negro: Lucky Losers, Kimberly Drummond y Salvatore, cada nombre repetido cuatro veces, en Chilla Calavera, 24 de julio a las 23, entrada gratuita.',
    bands: ['Kimberly Drummond', 'Salvatore'],
  },
  {
    id: '2026-08-29-chilla-calavera',
    date: '2026-08-29',
    venue: 'Chilla Calavera',
    city: null,
    flyer: '2026-08-29-chilla-calavera.jpg',
    alt: 'Flyer "Último reci en Chilla": Kimberly Drummond, Lucky Losers y The Jack Valiant, sábado 29 de agosto a las 21, entrada libre y gratuita, Alem y Martiniano Rodríguez.',
    bands: ['Kimberly Drummond', 'The Jack Valiant'],
  },
  {
    id: '2026-09-12-patio-espiral',
    date: '2026-09-12',
    venue: 'Patio Espiral',
    city: null,
    flyer: '2026-09-12-patio-espiral.jpg',
    alt: 'Flyer dibujado "Torneo de Mortal Kombat": dos personajes frente a un televisor que anuncia Pebete Sonder x Lucky Losers, 12 de septiembre, Patio Espiral, Bolivia 150.',
    bands: ['Pebete Sonder'],
  },
  {
    id: '2026-09-26-patio-espiral',
    date: '2026-09-26',
    venue: 'Patio Espiral',
    city: null,
    flyer: '2026-09-26-patio-espiral.jpg',
    alt: 'Flyer naranja "In Bloom": Amuletos, Lucky Losers, Pebete Sonder y Bella Vista en Patio Espiral, 26 de septiembre, puertas a las 18, sobre una foto de ovejas.',
    bands: ['Amuletos', 'Pebete Sonder', 'Bella Vista'],
  },
];

const sections: SiteData['sections'] = {
  band: { index: '01', title: 'Quiénes', intro: 'Perdedores con suerte.' },
  archive: { index: '02', title: 'Archivo', intro: 'Una noche, un sótano, volumen excesivo.' },
  music: { index: '03', title: 'Música', intro: 'Escuchá fuerte.' },
  video: { index: '04', title: 'Video', intro: '' },
  live: { index: '05', title: 'En vivo', intro: 'Las fechas que ya tocamos.' },
  shows: { index: '06', title: 'Shows', intro: 'Vení. O no.' },
  contact: { index: '07', title: 'Contacto', intro: 'Escribinos. Quizás respondamos.' },
};

// La numeración del índice es la misma de cada sección (01 — Banda, etc.).
const navigation: NavItem[] = [
  { label: 'Banda', target: 'banda', index: sections.band.index },
  { label: 'Música', target: 'musica', index: sections.music.index },
  ...(featuredVideo ? [{ label: 'Video', target: 'video', index: sections.video.index } as const] : []),
  // "En vivo" abre el archivo de fechas si existe; si no, las próximas fechas.
  pastShows.length > 0
    ? { label: 'En vivo', target: 'en-vivo', index: sections.live.index, alsoActiveIn: ['shows'] }
    : { label: 'En vivo', target: 'shows', index: sections.shows.index },
  { label: 'Contacto', target: 'contacto', index: sections.contact.index },
];

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

  navigation,

  sections,

  photos: {
    hero: {
      id: 'escenario',
      src: photoStage,
      alt: 'Lucky Losers tocando en vivo bajo luz roja: el guitarrista en primer plano con una estela de luz cruzando la imagen, la banda detrás.',
      focus: '50% 35%',
    },
    band: {
      id: 'guitarra',
      src: photoGuitar,
      alt: 'Guitarrista de pelo largo y remera blanca tocando una guitarra roja en un cuarto iluminado de rojo.',
      focus: '55% 40%',
    },
    archive: [
      {
        id: 'cantante',
        src: photoSinger,
        alt: 'El cantante gritando con la guitarra en alto, la batería y afiches pegados en la pared detrás.',
        focus: '45% 45%',
      },
      {
        id: 'bajo-bateria',
        src: photoBassDrums,
        alt: 'El bajista inclinado sobre su bajo y el baterista detrás, con una línea de luz roja en movimiento.',
        focus: '50% 50%',
      },
      {
        id: 'publico',
        src: photoCrowd,
        alt: 'Vista desde atrás del público apretado en una sala con techo de madera, mirando a la banda tocar al fondo.',
        focus: '50% 55%',
      },
    ],
  },

  // Duraciones medidas de los archivos (afinfo). Si se reemplaza un MP3,
  // actualizar `durationSeconds`.
  tracks: [
    {
      id: 'track-01',
      title: 'No haces nada',
      src: '/audio/track1.mp3',
      durationSeconds: 163,
      year: null,
      link: null,
    },
    {
      id: 'track-02',
      title: 'Descarga',
      src: '/audio/track2.mp3',
      durationSeconds: 192,
      year: null,
      link: null,
    },
    {
      id: 'track-03',
      title: 'Tempestad',
      src: '/audio/track3.mp3',
      durationSeconds: 254,
      year: null,
      link: null,
    },
  ],

  featuredVideo,
  pastShows,

  // TODO(contenido): cargar próximas fechas. Formato:
  // { id: '2026-11-14-caba', date: '2026-11-14', city: 'Ciudad', venue: 'Lugar',
  //   ticketUrl: 'https://…' | null, status: 'available' | 'sold-out' | 'free' | 'tba' }
  // Las fechas pasadas se muestran tachadas automáticamente.
  shows: [],
  showsEmpty: { title: 'Sin fechas. Por ahora.', subtitle: 'Volvemos con ruido.' },

  contact: {
    email: 'somosluckylosers@gmail.com',
    whatsapp: 'https://api.whatsapp.com/send/?phone=%2B542983521364&text&type=phone_number&app_absent=0',
    // TODO(contenido): canales separados de booking y prensa, si existen.
    booking: null,
    press: null,
  },
  contactCopy: { cta: 'Contactanos' },

  // Solo redes reales: un link sin URL no se renderiza.
  socialLinks: [
    { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/luckylosers__' },
    { id: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@LUCKYLOSERS' },
  ],
};
