import type { ImageMetadata } from 'astro';

/**
 * Convención de contenido: un campo `null` significa "dato real pendiente".
 * Los componentes saben renderizar ese estado sin inventar información,
 * y `collectPendingContent()` lo lista en cada build.
 */
export type Pending<T> = T | null;

export interface SiteMeta {
  title: string;
  description: string;
  /** BCP 47, p. ej. `es-AR`. */
  lang: string;
  /** Formato Open Graph, p. ej. `es_AR`. */
  ogLocale: string;
  ogTitle: string;
  ogDescription: string;
  themeColor: string;
  keywords: string[];
}

export interface Band {
  name: string;
  /** Las dos palabras del nombre, para composiciones tipográficas. */
  nameParts: readonly [string, string];
  shortName: string;
  tagline: string;
  /** Frases alternativas de la banda; se usan como textos de escena. */
  taglines: string[];
  statement: string;
  bio: string;
  /** Bio extendida (formación, ciudad, año, historia). */
  bioExtended: Pending<string>;
  city: Pending<string>;
  genre: Pending<string>;
  foundedYear: Pending<string>;
  closingLine: string;
}

export interface NavItem {
  label: string;
  /** id de la sección destino, sin `#`. */
  target: SectionId;
  /** Numeración editorial: la misma de la sección destino. */
  index: string;
  /** Otras secciones en las que este link también se marca como activo. */
  alsoActiveIn?: SectionId[];
}

export type SectionId =
  | 'inicio'
  | 'banda'
  | 'archivo'
  | 'musica'
  | 'video'
  | 'en-vivo'
  | 'shows'
  | 'contacto';

export interface Photo {
  id: string;
  src: ImageMetadata;
  alt: string;
  /** `object-position` para encuadres recortados. */
  focus?: string;
}

export interface Track {
  id: string;
  title: string;
  /** Ruta pública del archivo de audio. */
  src: string;
  /** Duración medida del archivo, en segundos. Evita precargar metadata. */
  durationSeconds: number;
  year: Pending<string>;
  /** Link externo (Spotify / Bandcamp / etc.). */
  link: Pending<string>;
}

export type ShowStatus = 'available' | 'sold-out' | 'free' | 'tba';

export interface Show {
  id: string;
  /** Fecha ISO `AAAA-MM-DD`. */
  date: string;
  city: string;
  venue: string;
  ticketUrl: Pending<string>;
  status: ShowStatus;
}

/** Solo redes con URL real: una red sin URL no se carga (no se muestran links vacíos). */
export interface VideoSource {
  /** Ruta pública, p. ej. `/video/tempestad.mp4`. */
  src: string;
  type: 'video/mp4' | 'video/webm';
}

/**
 * Video destacado (sección Video). Una sola API para dos orígenes:
 * - `local`: archivos propios en `public/video/` (uno o más formatos).
 * - `youtube`: ID explícito de un video del canal. Se carga con "fachada":
 *   primero el poster, el iframe recién cuando el usuario da play.
 */
export type FeaturedVideo =
  | {
      kind: 'local';
      title: string;
      sources: VideoSource[];
      poster: ImageMetadata;
      /** Dimensiones del video (definen el aspect ratio, sin CLS). */
      width: number;
      height: number;
    }
  | {
      kind: 'youtube';
      title: string;
      /** ID del video (lo que sigue a `watch?v=`). Nunca inferirlo: debe ser explícito. */
      videoId: string;
      /** Poster propio; si falta, se usa la miniatura de YouTube. */
      poster?: ImageMetadata;
    };

/** Concierto ya realizado, con su flyer real (sección En vivo). */
export interface PastShow {
  id: string;
  /** Fecha ISO `AAAA-MM-DD`. El año de agrupación se deriva de acá. */
  date: string;
  venue: string;
  city: Pending<string>;
  /** Nombre del archivo del flyer real en `src/assets/flyers/` (p. ej. `2026-05-12-lugar.jpg`). */
  flyer: string;
  /** Descripción del flyer para lectores de pantalla. */
  alt: string;
  /** Otras bandas de la fecha, si se quiere registrar. */
  bands?: string[];
}

export interface SocialLink {
  id: 'instagram' | 'spotify' | 'bandcamp' | 'youtube' | 'soundcloud' | 'tiktok';
  label: string;
  href: string;
}

export interface Contact {
  email: Pending<string>;
  /** Link de "click to chat" de WhatsApp (api.whatsapp.com/send…). */
  whatsapp: Pending<string>;
  booking: Pending<string>;
  press: Pending<string>;
}

export interface SectionCopy {
  index: string;
  title: string;
  intro: string;
}

export interface SiteData {
  meta: SiteMeta;
  band: Band;
  navigation: NavItem[];
  sections: Record<'band' | 'archive' | 'music' | 'video' | 'live' | 'shows' | 'contact', SectionCopy>;
  photos: {
    hero: Photo;
    band: Photo;
    /**
     * Rollo del archivo (sección pinned), en orden de aparición.
     * El último cuadro se expande a pantalla completa como transición.
     */
    archive: Photo[];
  };
  tracks: Track[];
  /** `null` = la sección Video no se renderiza. */
  featuredVideo: FeaturedVideo | null;
  /** Archivo de fechas pasadas. Vacío = la sección En vivo no se renderiza. */
  pastShows: PastShow[];
  /** Próximas fechas. */
  shows: Show[];
  showsEmpty: { title: string; subtitle: string };
  contact: Contact;
  contactCopy: { cta: string };
  socialLinks: SocialLink[];
}
