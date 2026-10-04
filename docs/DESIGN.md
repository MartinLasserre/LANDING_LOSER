# LUCKY LOSERS — DESIGN.md (v2)

Concepto (se mantiene desde la v1): **"Ruido blanco en una habitación negra."** Un show en un sótano: humo, feedback, volumen excesivo. Influencia: The Jesus and Mary Chain (*Psychocandy*, *Darklands*).

La v2 lo lleva a un lenguaje **editorial**: afiche de recital, fotocopia, revista independiente, copia de laboratorio. La página se recorre como un show — el scroll es la línea de tiempo.

## Principios

1. **La banda es protagonista, no la tecnología.** Cada animación explica jerarquía, profundidad, transición o feedback; si no, no va.
2. **Caos controlado.** Escalas extremas, asimetría, cosas que sangran fuera del viewport — pero la información (tracks, fechas, contacto) siempre legible y usable.
3. **Nada de cajas ni sombras.** Tipografía, líneas de 1 px, fotografía y espacio negativo.
4. **Un solo acento caliente**, usado poco.
5. **El glitch es un acento**, no un estado permanente.

## Paleta

Extraída de las fotos del show (ver [PALETA.md](PALETA.md)). Tokens en `src/styles/tokens.css`.

| Token | Hex | Uso |
| --- | --- | --- |
| `--color-ink` | `#1A0303` | fondo base |
| `--color-ink-deep` | `#0B0101` | bloques de transición, cuarto oscuro |
| `--color-oxblood` | `#480000` | humo, fondo de imágenes cargando |
| `--color-blood` | `#A80018` | solo tipografía muy grande (SHOWS, LOSERS del outro) |
| `--color-neon` | `#FF2A1A` | progreso del audio, hover de fechas, glitch |
| `--color-glow` | `#FF7A66` | metadata y texto chico en rojo (contraste AA sobre ink) |
| `--color-bone` | `#E8E4DC` | texto principal (blanco sucio) |

## Tipografía

Dos familias, autoalojadas:

- **Archivo** variable (ejes `wdth` 62–125 y `wght`). La jerarquía juega con el **ancho**:
  - DISPLAY — expandida (125 %), peso 850, mayúsculas: el nombre de la banda. Tamaño calculado para que "LOSERS" entre siempre en una línea.
  - HEADLINE — condensada (62 %), 800, mayúsculas: títulos de sección, statements.
  - BODY — normal (100 %), 400.
- **IBM Plex Mono** 400 — META (chica, mayúsculas, tracking 0.18em) y NÚMEROS (tabulares: índices, tiempos, fechas).

Escala fluida con `clamp()`/`min()` en `tokens.css` (`--fs-display` … `--fs-micro`). Texto vertical (`.t-vertical`) para lomos editoriales; contorno (`.t-outline`) para tipografía de fondo.

## Composición

- Grilla de 12 columnas (`.grid-12`) con gutter fluido; mobile tiene su propia composición, no una reducción.
- Numeración editorial por sección (`01 ──── Banda`). Las fotos van limpias, sin pie.
- Fotos en formato retrato (las originales son 2:3), desplazadas del centro, sangrando fuera del viewport.
- Capas: atmósfera WebGL → textura → foto → tipografía → grano → UI.

## Recorrido

| # | Escena | Idea |
| --- | --- | --- |
| 00 | Hero | El primer golpe: el nombre cruza la foto. Al scrollear, las dos palabras se separan en direcciones opuestas y la foto se hunde. |
| 01 | Banda | Statement condensado que se enciende palabra por palabra; foto con parallax distinto al texto; "LOSERS" en contorno de fondo. |
| 02 | Archivo | Escena fija: un rollo de 3 cuadros que se apilan y giran como copias; el público inunda la pantalla; bloque negro con "Turn it up. Después, nada." |
| 03 | Música | Título gigante fijo a la izquierda, tracks a la derecha. El humo reacciona al audio real. |
| 04 | Shows | Cartel: fecha enorme condensada, ciudad, lugar en mono. Sin fechas → afiche "Sin fechas. Por ahora." |
| 05 | Contacto | "Escribinos. Quizás respondamos." Email grande + redes. |
| — | Outro | Las dos palabras del nombre, que se separaban en el hero, vuelven a juntarse. |

## Motion

- Interacciones: 150–400 ms (`--dur-fast/base/slow`). Entradas: 0,7–1,8 s con `expo.out`/`power3.out`.
- Todo lo ligado al scroll usa `scrub`; las secuencias, timelines.
- Se anima `transform`, `opacity` y `clip-path` (con moderación).
- Microinteracciones: subrayado que se dibuja (links), texto que se desplaza (botones), fila que se corre y se inclina (fechas), ecualizador animado (track sonando), indicador de sección activa (nav).
- `prefers-reduced-motion`: sin smooth scroll, sin parallax, sin pin, sin intro; contenido inmediatamente visible.

## Atmósfera (WebGL)

Humo fBm con domain warping en la paleta de ink → oxblood → blood con picos neon; aberración cromática radial; pulso de distorsión cada 8–12 s y en cambios de escena; viñeta. Reacciona a la sección (densidad), al scroll, al mouse y al audio. El grano está en CSS. Si no hay WebGL, el fondo CSS reproduce el mismo humo con gradientes.
