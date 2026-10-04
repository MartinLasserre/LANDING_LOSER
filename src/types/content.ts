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
}

export type SectionId = 'inicio' | 'banda' | 'archivo' | 'musica' | 'shows' | 'contacto';

export interface Photo {
  id: string;
  src: ImageMetadata;
  alt: string;
  /** Pie editorial corto. */
  caption: string;
  /** `object-position` para encuadres recortados. */
  focus?: string;
  year: Pending<string>;
  location: Pending<string>;
  credit: Pending<string>;
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

export interface SocialLink {
  id: 'instagram' | 'spotify' | 'bandcamp' | 'youtube' | 'soundcloud' | 'tiktok';
  label: string;
  href: Pending<string>;
}

export interface Contact {
  email: Pending<string>;
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
  sections: Record<'band' | 'archive' | 'music' | 'shows' | 'contact', SectionCopy>;
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
  shows: Show[];
  showsEmpty: { title: string; subtitle: string };
  contact: Contact;
  contactCopy: { cta: string };
  socialLinks: SocialLink[];
}
