import type { SiteData } from '@/types/content';

/**
 * Lista los datos reales que todavía faltan (campos `null`, secciones
 * vacías y títulos provisorios). Se imprime en cada build para que los
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

  const photos = [site.photos.hero, site.photos.band, ...site.photos.archive];
  const uncredited = photos.filter((p) => p.credit === null).map((p) => p.id);
  if (uncredited.length) pending.push(`photos.*.credit (${uncredited.join(', ')})`);

  site.tracks.forEach((t) => {
    if (/^Pista /.test(t.title)) pending.push(`tracks.${t.id}.title (provisorio: "${t.title}")`);
    check(t.link, `tracks.${t.id}.link`);
  });

  if (site.shows.length === 0) pending.push('shows (sin fechas cargadas)');
  site.shows.forEach((s) => check(s.ticketUrl, `shows.${s.id}.ticketUrl`));

  check(site.contact.email, 'contact.email');
  check(site.contact.booking, 'contact.booking');
  check(site.contact.press, 'contact.press');
  site.socialLinks.forEach((l) => check(l.href, `socialLinks.${l.id}.href`));

  return pending;
}
