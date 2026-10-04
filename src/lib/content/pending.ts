import type { SiteData } from '@/types/content';

/**
 * Lista los datos reales que todavía faltan (campos `null` y secciones
 * vacías). Se imprime en cada build para que los
 * pendientes no queden ocultos en el código.
 */
export function collectPendingContent(site: SiteData, siteUrl: URL | undefined): string[] {
  const pending: string[] = [];
  const check = (value: unknown, label: string) => {
    if (value === null) pending.push(label);
  };

  if (!siteUrl) pending.push('astro.config.mjs → SITE_URL (dominio: canonical, og:url, og:image absoluta)');
  check(site.band.bioExtended, 'band.bioExtended');
  check(site.band.city, 'band.city');
  check(site.band.genre, 'band.genre');
  check(site.band.foundedYear, 'band.foundedYear');

  site.tracks.forEach((t) => check(t.link, `tracks.${t.id}.link`));

  if (site.pastShows.length === 0) pending.push('pastShows (fechas pasadas con flyer)');
  const noCity = site.pastShows.filter((show) => show.city === null).length;
  if (noCity) pending.push(`pastShows.*.city (${noCity} fechas sin ciudad)`);
  if (site.shows.length === 0) pending.push('shows (próximas fechas)');
  site.shows.forEach((s) => check(s.ticketUrl, `shows.${s.id}.ticketUrl`));

  check(site.contact.email, 'contact.email');
  check(site.contact.whatsapp, 'contact.whatsapp');
  check(site.contact.booking, 'contact.booking');
  check(site.contact.press, 'contact.press');

  return pending;
}
