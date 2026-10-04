// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

/**
 * Dominio público del sitio. Mientras sea `undefined`, Astro no genera URLs
 * absolutas (canonical / og:url / og:image absolutas se omiten).
 * TODO(contenido): definir el dominio real, p. ej. 'https://luckylosers.com.ar'.
 * @type {string | undefined}
 */
const SITE_URL = undefined;

export default defineConfig({
  ...(SITE_URL ? { site: SITE_URL } : {}),
  // Sitio estático de una sola página: nada que hidratar ni renderizar en servidor.
  output: 'static',
  build: {
    // CSS crítico chico → inline evita una request bloqueante en el primer render.
    inlineStylesheets: 'auto',
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Archivo',
      cssVariable: '--font-archivo',
      weights: ['400 900'],
      styles: ['normal'],
      stretch: '62% 125%',
      subsets: ['latin'],
      // Eje de ancho: condensada (62) para titulares, expandida (125) para el nombre.
      options: { experimental: { variableAxis: { wdth: [['62', '125']] } } },
      fallbacks: ['Arial Narrow', 'Helvetica Neue', 'Arial', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'IBM Plex Mono',
      cssVariable: '--font-plex-mono',
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'Menlo', 'monospace'],
    },
  ],
});
