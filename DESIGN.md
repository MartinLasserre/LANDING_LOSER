# LUCKY LOSERS — DESIGN.md

Concepto: **"Ruido blanco en una habitación negra."** Sitio como un show en un sótano: humo, feedback, volumen excesivo. Casi todo es negro; la tipografía aparece como si emergiera de la niebla. Menos elementos, más atmósfera. Influencia: The Jesus and Mary Chain (Psychocandy, Darklands): negro, melodía enterrada bajo distorsión, reverb.

Principios:
1. El fondo 3D es el protagonista; la UI es mínima y flota encima.
2. Nada de cajas, tarjetas ni sombras. Solo texto, líneas finas de 1px y espacio.
3. Todo aparece con fade/blur/desenfoque y se "enfoca" (como salir del feedback).
4. Un solo acento de color, usado casi nunca.

---

## 1. Paleta

| Token | Hex | Uso |
|---|---|---|
| `--black` | `#050505` | Fondo base |
| `--smoke` | `#121212` | Superficies muy sutiles / overlays |
| `--ash` | `#8A8A8A` | Texto secundario, metadatos |
| `--bone` | `#E8E4DC` | Texto principal (blanco sucio, no puro) |
| `--blood` | `#B3121B` | Único acento: hover, foco, detalle puntual |

Extras para el shader (no UI): humo frío `#1A1C22`, luz de feedback `#E8E4DC`, aberración R `#FF2A2A` / B `#2A4BFF` a muy baja intensidad.

Reglas: contraste texto/fondo ≥ 7:1 con `--bone`. `--blood` nunca en párrafos; máx. 1 uso por viewport.

## 2. Tipografías (Google Fonts, gratis)

- **Display:** **`Syne`** (800) para el nombre de la banda: ancha, tensa, algo hostil. Alternativa: `Anton`.
- **Texto/UI:** **`IBM Plex Mono`** (300, 400): técnico, frío, tipo etiqueta de cinta/demo.
- **Acento editorial (opcional, citas):** **`Cormorant Garamond`** italic 300: contraste romántico/sucio (Darklands).

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&family=IBM+Plex+Mono:wght@300;400&family=Cormorant+Garamond:ital,wght@1,300&display=swap" rel="stylesheet">
```

## 3. Escala tipográfica (fluida, ratio ~1.5)

| Token | Valor | Uso |
|---|---|---|
| `--fs-mega` | `clamp(3.5rem, 15vw, 14rem)` | LUCKY LOSERS en hero |
| `--fs-xl` | `clamp(2rem, 6vw, 5rem)` | Títulos de sección |
| `--fs-lg` | `clamp(1.25rem, 2.5vw, 2rem)` | Citas / lead |
| `--fs-md` | `1rem` | Texto |
| `--fs-sm` | `0.75rem` | Etiquetas, fechas |

- Display: mayúsculas, `letter-spacing: -0.02em`, `line-height: 0.9`.
- Mono: `line-height: 1.7`, `letter-spacing: 0.04em`; etiquetas en mayúsculas con `0.2em`.
- Ancho máximo de párrafo: `52ch`.

## 4. Espaciado

Base 8px: `--s-1:.5rem; --s-2:1rem; --s-3:1.5rem; --s-4:2.5rem; --s-5:4rem; --s-6:7rem; --s-7:12rem`.
Padding lateral: `clamp(1.25rem, 5vw, 5rem)`. Secciones: `min-height: 100vh`, separación vertical `--s-7`. Mucho vacío a propósito.

## 5. Layout por sección

Navegación: fija arriba, solo 4 enlaces mono en mayúsculas, `--fs-sm`, a la derecha; logo "LL" diminuto a la izquierda. Sin fondo. `mix-blend-mode: difference`.

**Hero**
- Pantalla completa, fondo 3D visible sin tapar.
- `LUCKY LOSERS` centrado, enorme, en dos líneas; con leve glitch/aberración cromática que se intensifica con el mouse.
- Debajo, mono pequeño: `NOISE POP / BUENOS AIRES` (ajustar ciudad) y un indicador `↓ SCROLL` parpadeando lento.
- Entrada: texto emerge de blur 30px → 0 con opacidad, 2.4s.

**Sobre la banda**
- Columna de texto asimétrica a la izquierda (cols 2–6 de 12), bio de 3–4 líneas máx. en mono.
- Una cita en Cormorant italic `--fs-lg`, desplazada a la derecha (cols 7–12), color `--ash`.
- Revelado línea por línea al hacer scroll. Sin fotos o con una sola imagen B/N con grano y 20% opacidad.

**Música**
- Lista vertical de lanzamientos: `01  TÍTULO ..... 2026  ▶` en filas separadas por línea 1px `rgba(232,228,220,.15)`.
- Título en `--fs-xl` Syne; al hover de una fila, las demás bajan a 25% de opacidad, el título tiene aberración y el fondo 3D reacciona (más feedback).
- Enlaces a Spotify/Bandcamp/YouTube como texto mono, sin botones.

**Shows**
- Tabla tipográfica: fecha (mono) · ciudad (Syne `--fs-lg`) · lugar (ash) · `TICKETS →`.
- Próximos con 100% de opacidad; pasados tachados y al 30%.
- Estado vacío: `NO HAY FECHAS. VOLVEMOS CON RUIDO.`
- Hover: línea inferior que se dibuja de izquierda a derecha en `--blood`.

**Contacto / redes**
- Centrado, casi vacío. Email enorme (`--fs-xl`) como único CTA; debajo, redes (Instagram, Spotify, Bandcamp, YouTube) en fila mono.
- Footer: `© 2026 LUCKY LOSERS` + `TURN IT UP.` en ash, `--fs-sm`.

## 6. Micro-interacciones

- **Cursor:** punto de 8px `--bone` con `mix-blend-mode: difference`; sobre enlaces crece a 48px (anillo) con retardo (lerp 0.15). Deja una estela tenue.
- **Enlaces:** hover → color `--blood` + leve separación RGB (`text-shadow: 1px 0 #f22, -1px 0 #24f`) durante 200ms; subrayado dibujado.
- **Texto en scroll:** `opacity 0, blur(12px), translateY(20px)` → normal, easing `cubic-bezier(.2,.7,.1,1)`, 1.2s.
- **Glitch del título:** cada 6–10s, 150ms de desplazamiento RGB + `clip-path` en tiras.
- **Scroll:** suave (Lenis opcional); el scroll controla la intensidad del shader (más scroll = más distorsión).
- **Transiciones de sección:** el fondo cambia levemente de tono/densidad por sección.
- **Selección de texto:** fondo `--blood`, texto `--black`.
- **Audio (opcional):** botón `SOUND ON/OFF`; con drone/feedback bajo. Nunca autoplay.
- Respetar `prefers-reduced-motion`: sin glitch, animación del fondo a baja velocidad.

## 7. Ideas de fondo 3D / shader (para Three.js)

1. **Humo (base):** fragment shader con fBm/simplex noise 3D (3–5 octavas) y domain warping, con el tiempo como 3er eje. Paleta `#050505` → `#1A1C22`, con picos de luz `--bone` al 10%. Movimiento lento y constante.
2. **Feedback visual:** render-to-texture con ping-pong: el frame anterior se reescala 1.01, rota 0.2° y se mezcla al 92–96% con el nuevo. Genera estelas y túneles tipo feedback de video/guitarra.
3. **Grano de película:** ruido hash por píxel animado cada frame, 6–10% de opacidad, overlay final (post-proceso).
4. **Aberración cromática:** en post-proceso, desplazar R y B radialmente desde el centro (0.002–0.006 uv); aumenta con scroll velocity y hover de música.
5. **Reacción al mouse:** el cursor inyecta "turbulencia" (uniform `uMouse`) que desvía el humo, como una corriente de aire.
6. **Partículas de polvo/ceniza:** 2–5k puntos con baja opacidad que derivan en curl noise; profundidad con niebla `FogExp2`.
7. **Pulso de distorsión:** cada ~8s, onda que deforma la UV (sin/noise) 300ms, simulando un golpe de acorde distorsionado.
8. **Scanlines/viñeta:** viñeta fuerte (bordes en negro puro) para centrar la atención y que el texto siempre tenga contraste.
9. **Alternativa geométrica:** plano o esfera con displacement por noise, wireframe en `--ash` al 15%, rotando lento, difuminado por bloom.

Rendimiento: `devicePixelRatio ≤ 1.5`, resolución del feedback a 50%, pausar con `visibilitychange`, fallback CSS (gradiente + grano SVG) en móvil de gama baja.
Importante: overlay `linear-gradient(transparent, #050505cc)` tras el texto si hace falta legibilidad.

## 8. Variables CSS (copiar)

```css
:root {
  /* Color */
  --black: #050505;
  --smoke: #121212;
  --ash: #8A8A8A;
  --bone: #E8E4DC;
  --blood: #B3121B;
  --line: rgba(232, 228, 220, 0.15);

  /* Tipografía */
  --font-display: 'Syne', 'Anton', sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, monospace;
  --font-serif: 'Cormorant Garamond', Georgia, serif;

  --fs-mega: clamp(3.5rem, 15vw, 14rem);
  --fs-xl: clamp(2rem, 6vw, 5rem);
  --fs-lg: clamp(1.25rem, 2.5vw, 2rem);
  --fs-md: 1rem;
  --fs-sm: 0.75rem;

  /* Espaciado */
  --s-1: 0.5rem;
  --s-2: 1rem;
  --s-3: 1.5rem;
  --s-4: 2.5rem;
  --s-5: 4rem;
  --s-6: 7rem;
  --s-7: 12rem;
  --gutter: clamp(1.25rem, 5vw, 5rem);
  --measure: 52ch;

  /* Movimiento */
  --ease-out: cubic-bezier(0.2, 0.7, 0.1, 1);
  --t-fast: 200ms;
  --t-base: 600ms;
  --t-slow: 1200ms;
  --t-reveal: 2400ms;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; }

html { background: var(--black); color: var(--bone); }

body {
  font-family: var(--font-mono);
  font-weight: 300;
  font-size: var(--fs-md);
  line-height: 1.7;
  letter-spacing: 0.04em;
  -webkit-font-smoothing: antialiased;
}

h1, h2 {
  font-family: var(--font-display);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  line-height: 0.9;
}
h1 { font-size: var(--fs-mega); }
h2 { font-size: var(--fs-xl); }

.label {
  font-size: var(--fs-sm);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--ash);
}

a { color: inherit; text-decoration: none; transition: color var(--t-fast); }
a:hover { color: var(--blood); text-shadow: 1px 0 #f22, -1px 0 #24f; }

::selection { background: var(--blood); color: var(--black); }

.reveal {
  opacity: 0;
  filter: blur(12px);
  transform: translateY(20px);
  transition: opacity var(--t-slow) var(--ease-out),
              filter var(--t-slow) var(--ease-out),
              transform var(--t-slow) var(--ease-out);
}
.reveal.is-in { opacity: 1; filter: none; transform: none; }

@media (prefers-reduced-motion: reduce) {
  .reveal { transition: none; opacity: 1; filter: none; transform: none; }
}
```
