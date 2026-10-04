# LUCKY LOSERS — sitio web

Experiencia web de una sola página para la banda. El recorrido está pensado como un show:
silencio → el nombre → la banda → el archivo de una noche → la música → las fechas → el contacto → el nombre otra vez.

```
00 Hero        nombre gigante, foto en vivo, atmósfera WebGL
01 Banda       statement que se "lee" con el scroll, foto que sangra fuera del viewport
02 Archivo     escena pinned: rollo de 3 cuadros → el público inunda la pantalla → bloque negro
03 Música      player propio (3 tracks)
04 Shows       cartel de recital (o afiche "Sin fechas" mientras no haya fechas)
05 Contacto    email + redes
   Outro       el nombre vuelve a juntarse
```

## Stack

| Herramienta | Responsabilidad |
| --- | --- |
| [Astro](https://astro.build) 7 | Arquitectura, componentes, render estático, optimización de imágenes y fuentes |
| TypeScript (strictest) | Tipos del contenido y de toda la lógica de cliente |
| GSAP + ScrollTrigger + SplitText | Motion system: entradas, reveals, parallax, escena pinned |
| Lenis | Smooth scroll (solo con motion activo; en touch queda el scroll nativo) |
| Three.js | Atmósfera de fondo (humo, aberración cromática, pulso). Carga diferida |
| CSS moderno | Layout, tipografía fluida, grano, estados, responsive |

No hay frameworks de UI ni de CSS: el contenido es HTML real generado en build; el único JS es el de interacción y motion.

## Requisitos

- Node **≥ 22.12** (lo exige Astro 7). El repo incluye `.nvmrc`: `nvm use`.

## Comandos

```bash
npm install
npm run dev        # servidor de desarrollo (http://localhost:4321)
npm run build      # astro check (tipos) + build estático en dist/
npm run preview    # sirve dist/
npm run check      # solo chequeo de tipos/diagnósticos (alias: npm run typecheck)
```

`npm run build` falla si hay errores de TypeScript. Además imprime la lista de **contenido real pendiente** (ver más abajo).

El resultado (`dist/`) es estático: se puede publicar en cualquier hosting de archivos (Netlify, Vercel, Cloudflare Pages, GitHub Pages, un bucket…). Conviene que el hosting sirva con gzip/brotli: el JS principal pesa ~59 KB comprimido.

## Estructura

```
src/
├── pages/index.astro              compone la página
├── layouts/BaseLayout.astro       <head>: SEO, Open Graph, JSON-LD, fuentes, progressive enhancement
├── components/
│   ├── navigation/SiteHeader      nav fija: sección activa, progreso, control global de audio
│   ├── sections/                  Hero, Band, Archive, Music, Shows, Contact
│   ├── music/MusicPlayer          lista de tracks + deck (HTML semántico; lógica en lib/audio)
│   ├── layout/SiteFooter          outro
│   ├── effects/Atmosphere         canvas WebGL (capa 0)
│   └── ui/                        Photo (figura editorial), SectionMeta (numeración)
├── data/site.ts                   ★ fuente única de contenido
├── types/content.ts               tipos del contenido
├── lib/
│   ├── main.ts                    orquestador del cliente
│   ├── env.ts                     media queries compartidas, helpers
│   ├── animations/                gsap (registro), hero, reveal, parallax, archive, outro, glitch, index (matchMedia)
│   ├── scroll/                    smooth-scroll (Lenis), anchors (links #), sections (sección activa)
│   ├── audio/                     audio-manager, player (UI), visualizer
│   ├── webgl/                     atmosphere (Three.js), shaders, index (carga diferida + detección)
│   ├── content/                   formateo (tiempos, fechas) y reporte de pendientes
│   └── ui/copy.ts                 botón "copiar email"
├── styles/                        tokens.css, typography.css, global.css
└── assets/photos/                 fotos originales (Astro genera WebP/JPG responsive)
public/
├── audio/track{1,2,3}.mp3
└── favicon.svg
docs/
├── DESIGN.md                      dirección visual y sistema de diseño
├── PALETA.md                      paleta extraída de las fotos
└── explorations/                  prototipos HTML históricos (no forman parte del build)
```

## Progressive enhancement

```
HTML funciona → CSS presenta → JS agrega interacción → GSAP agrega motion → WebGL agrega atmósfera
```

- Sin JS: todo el contenido es visible, las anclas funcionan y la música se puede escuchar con reproductores nativos (`<noscript>`).
- Un script mínimo en `<head>` agrega `js` y `motion` a `<html>`. Solo con `motion` hay estados iniciales ocultos para animar. Si el motion system no arranca en 3 s, `motion` se retira y todo queda visible.
- Con `prefers-reduced-motion: reduce`: sin Lenis, sin parallax, sin pin, sin intro; el archivo se muestra como secuencia vertical estática y la atmósfera es un único cuadro quieto. Si el usuario cambia la preferencia en vivo, `gsap.matchMedia()` revierte todo.
- Sin WebGL (o con "ahorro de datos"): Three.js ni siquiera se descarga; queda el fondo CSS (gradientes del mismo humo rojo + grano).

## Arquitectura de animación

Todo el motion vive en `src/lib/animations/` y se registra en `initMotion()` (`index.ts`) dentro de `gsap.matchMedia()`:

- **Un solo loop**: Lenis, ScrollTrigger, la atmósfera WebGL y el visualizador de audio corren en `gsap.ticker`. No hay `requestAnimationFrame` propios.
- **Contextos**: intro y reveals dependen solo de "motion"; parallax y la escena pinned dependen además del tamaño (mobile recibe distancias y duraciones menores). Cruzar el breakpoint no repite la intro.
- **Cleanup**: cada módulo devuelve su función de limpieza; `gsap.matchMedia().revert()` mata triggers y tweens. En desarrollo el HMR limpia todo antes de recargar.

### API declarativa (atributos en el HTML)

| Atributo | Efecto |
| --- | --- |
| `data-reveal` | sube y aparece al entrar en viewport (una vez) |
| `data-reveal-group` | sus hijos aparecen en cascada |
| `data-reveal-clip` | la foto se descubre de abajo hacia arriba |
| `data-scrub-words` | la frase se "enciende" palabra por palabra con el scroll |
| `data-parallax="0.1"` | parallax vertical (fracción del alto del viewport; + atrás, − adelante) |
| `data-parallax-x="-0.2"` | parallax horizontal |
| `data-section`, `data-section-index`, `data-section-label`, `data-atmosphere` | sección rastreada por la nav; `data-atmosphere` (0–1) fija la intensidad del humo |

Los reveals animan solo `opacity`/`transform` (nunca `visibility`): un elemento aún no revelado sigue siendo enfocable con teclado.

### Glitch

Es un acento, no un estado: se dispara una vez en la entrada del nombre y en el cambio de escena del archivo (`glitchOnce()`).

## Arquitectura WebGL

`src/lib/webgl/` — evolución del shader original de la v1:

- **Dos pases**: el humo (fBm con domain warping, lo caro) se calcula una sola vez a baja resolución en un render target; un pase de post barato aplica aberración cromática, el "pulso de acorde", la paleta y la viñeta. En la v1 el humo se calculaba tres veces por píxel a resolución completa.
- **Calidad**: `high` (5 octavas, humo al 50 %, DPR ≤ 1,5) o `low` (3 octavas, 33 %, DPR 1) según ancho de pantalla y núcleos de CPU.
- **Reacciona a**: sección activa (intensidad), progreso del hero, velocidad de scroll, mouse (solo puntero fino), nivel real del audio que suena, y un pulso en los cambios de escena.
- **Ciclo de vida**: `ResizeObserver`, pausa con `visibilitychange`, manejo de `webglcontextlost`, `destroy()` libera geometría, materiales, render target y renderer.
- El grano de película está en CSS (`body::after`), así se mantiene nítido a cualquier resolución.

## Arquitectura de audio

`src/lib/audio/`:

- **`AudioManager`**: un único `HTMLAudioElement` para todo el sitio — empezar un track pausa el anterior por diseño. Expone `play`, `pause`, `toggle`, `seek`, `load`, `subscribe`, `getLevel`, `getBands`, `destroy`. Los listeners se registran con `AbortController`.
- **`preload = "none"`**: no se descarga ningún MP3 hasta que el usuario da play. Las duraciones se muestran desde `site.ts`.
- **Análisis**: el `AudioContext` + `AnalyserNode` se crea en el primer play (siempre tras un gesto del usuario). Si no hay Web Audio, el player funciona igual.
- **`player.ts`**: conecta el manager con el HTML (botones reales, `aria-label` dinámico, range de posición accesible con teclado y `aria-valuetext`, anuncios en `role="status"`), con el control global de la nav, con Media Session (controles del sistema / pantalla bloqueada) y avanza solo al siguiente track.
- **`visualizer.ts`**: forma de onda estilizada propia de cada track que muestra el progreso y respira con el espectro real mientras suena.

## Gestión de contenido

Todo el contenido está en **`src/data/site.ts`**, tipado por `src/types/content.ts`. Los componentes no tienen texto hardcodeado.

Convención: **`null` = dato real pendiente**. Nunca reemplazarlo por un dato inventado; el sitio sabe mostrar el estado pendiente y `npm run build` lista todo lo que falta:

```
[contenido] 20 datos reales pendientes (src/data/site.ts):
  · band.city
  · tracks.track-01.title (provisorio: "Pista uno")
  · contact.email
  …
```

### Fechas (shows)

```ts
shows: [
  {
    id: '2026-11-14-caba',
    date: '2026-11-14',          // AAAA-MM-DD
    city: 'Ciudad',
    venue: 'Lugar',
    ticketUrl: 'https://…',      // o null
    status: 'available',         // 'available' | 'sold-out' | 'free' | 'tba'
  },
],
```

Se ordenan solas por fecha. Las fechas pasadas se muestran tachadas — se calcula **en el build**, así que hay que volver a publicar para que una fecha pase a "Pasó". Con la lista vacía se muestra el afiche "Sin fechas. Por ahora."

### Tracks

1. Copiar el MP3 a `public/audio/`.
2. Agregar/editar en `tracks`: `title`, `src` (`/audio/archivo.mp3`), `durationSeconds` (en macOS: `afinfo archivo.mp3 | grep duration`), `link` opcional a una plataforma.

Los MP3 actuales son de 320 kbps (~24 MB en total). No afectan la carga inicial (`preload="none"`), pero una versión de 160–192 kbps reduciría el consumo de datos de quien escucha. No se re-codificaron para no degradar los masters sin acuerdo de la banda.

### Redes sociales

En `socialLinks`, completar `href`. Las que quedan en `null` se muestran como "pronto", sin link. IDs disponibles: `instagram`, `spotify`, `bandcamp`, `youtube`, `soundcloud`, `tiktok`. Las URLs cargadas también alimentan el `sameAs` del JSON-LD.

### Contacto

`contact.email`, `contact.booking`, `contact.press`. Con email cargado aparece un link `mailto:` grande y un botón "Copiar email". (El formulario `action="mailto:"` de la v1 se eliminó: dependía de que el visitante tuviera un cliente de correo configurado y enviaba texto plano. No se agregó un servicio de formularios externo.)

### Imágenes

1. Copiar la foto a `src/assets/photos/`.
2. Importarla en `site.ts` y asignarla en `photos` (`hero`, `band` o `archive`), con `alt` descriptivo, `caption`, y opcionalmente `focus` (`object-position`), `year`, `location`, `credit`.

Astro genera WebP + JPG en varios anchos, con dimensiones intrínsecas (sin CLS). La foto del hero se carga con prioridad alta; el resto, lazy.

> Las fotos actuales miden 682 × 1024 px. El diseño las usa en tamaños que no las estiran de más, pero con originales de mayor resolución (≥ 1600 px de lado largo) se verían mejor en pantallas grandes.

### Dominio, SEO y metadatos

- Dominio: `SITE_URL` en `astro.config.mjs`. Con dominio definido se generan `canonical`, `og:url` y `og:image` absolutas.
- Título, descripción, keywords y textos de Open Graph: `meta` en `site.ts`.
- La imagen social (1200 × 630) se genera sola desde la foto del hero.
- JSON-LD `MusicGroup`: solo incluye los datos reales cargados (ciudad, género, año y redes aparecen cuando dejan de ser `null`).

## Performance

Medido con throttling tipo Lighthouse mobile (Slow 4G, CPU 4×) sobre el preview local **sin compresión**:

| | FCP | LCP | CLS |
| --- | --- | --- | --- |
| Mobile (390 px) | ~1,9 s | ~2,2 s | 0 |
| Desktop (1440 px) | ~1,0 s | ~1,6–2,2 s | 0 |

- JS principal: ~59 KB gzip (GSAP + ScrollTrigger + SplitText + Lenis + código propio). Three.js (~130 KB gzip) se descarga después, en idle.
- Fuentes autoalojadas por Astro (Archivo variable con ejes `wdth`/`wght` ~90 KB, precargada; IBM Plex Mono 400 ~10 KB), `font-display: swap` con fallbacks de métricas ajustadas.
- La intro del hero espera a la fuente display (máx. 1 s) con las letras fuera de su línea de recorte, para que el cambio de fuente no produzca layout shift.

## Accesibilidad

- HTML semántico: `header/nav/main/section/footer`, un único `h1`, `h2` por sección, `h3` en tracks/fechas.
- Skip link, foco visible en todo, navegación por anclas que actualiza el hash y mueve el foco a la sección.
- Controles reales: `<button>` para play/pausa, `<input type="range">` para la posición.
- `aria-label` dinámicos en el player, anuncios de estado con `role="status"`, texto alternativo descriptivo en todas las fotos.
- Interacciones de hover solo como mejora (`@media (hover: hover)`); en touch todo funciona con tap.

## Qué cambió respecto de la v1

- Vite + JS vanilla → Astro + TypeScript. Se eliminaron `index.html`, `src/main.js`, `src/scene.js`, `src/style.css`; `node_modules/` y `dist/` dejaron de estar versionados.
- `content.json` (que duplicaba lo que había en el HTML) → `src/data/site.ts` tipado.
- Se corrigieron residuos del HTML (`` `r`n `` literales entre los tracks) y links falsos (`href="#shows"`, `mailto:hola@example.com`).
- Las fotos `foto0` y `foto4` no se usaban; ahora sí (hero y cierre del archivo).
- El glitch del título cada 6–10 s pasó a ser un acento puntual.
- `DESIGN.md` y `PALETA.md` se movieron a `docs/`; los prototipos de `opciones/` a `docs/explorations/`.
