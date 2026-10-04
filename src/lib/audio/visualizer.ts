import { gsap } from '@/lib/animations/gsap';
import type { AudioManager } from './audio-manager';

const BARS = 56;

/** Pseudo-aleatorio determinístico a partir del id del track. */
function seededShape(seed: string): Float32Array {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const shape = new Float32Array(BARS);
  for (let i = 0; i < BARS; i++) {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    const rnd = ((h ^ (h >>> 16)) >>> 0) / 4294967295;
    // Envolvente: entra suave, cuerpo, sale suave.
    const env = Math.sin((i / (BARS - 1)) * Math.PI) * 0.6 + 0.4;
    shape[i] = (0.25 + rnd * 0.75) * env;
  }
  return shape;
}

/**
 * Forma de onda estilizada en el deck: barras con perfil propio de cada
 * track; la parte reproducida se pinta en rojo neón y, mientras suena,
 * las barras respiran con el espectro real. Solo dibuja en el ticker
 * mientras hay reproducción; en pausa queda un cuadro estático.
 */
export function createVisualizer(canvas: HTMLCanvasElement, audio: AudioManager, { animate }: { animate: boolean }) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const context = ctx;

  const live = new Float32Array(BARS);
  const smooth = new Float32Array(BARS);
  let shape = seededShape('');
  let running = false;
  let width = 0;
  let height = 0;

  const colors = () => {
    const styles = getComputedStyle(canvas);
    return {
      played: styles.getPropertyValue('--color-neon').trim() || '#ff2a1a',
      rest: styles.getPropertyValue('--color-line-strong').trim() || 'rgb(255 122 102 / 0.5)',
    };
  };
  let palette = colors();

  function draw() {
    const { currentTime, duration } = audio.snapshot;
    const progress = duration > 0 ? currentTime / duration : 0;
    const hasLive = animate && audio.getBands(live);
    context.clearRect(0, 0, width, height);
    const gap = 2;
    const barW = Math.max(1, (width - gap * (BARS - 1)) / BARS);
    for (let i = 0; i < BARS; i++) {
      const target = hasLive ? (live[i] ?? 0) : 0;
      smooth[i] = (smooth[i] ?? 0) + (target - (smooth[i] ?? 0)) * 0.35;
      const base = shape[i] ?? 0;
      const h = Math.max(2, height * Math.min(1, base * (0.55 + (smooth[i] ?? 0) * 0.9)));
      context.fillStyle = i / BARS < progress ? palette.played : palette.rest;
      context.fillRect(i * (barW + gap), (height - h) / 2, barW, h);
    }
  }

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    palette = colors();
    draw();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  return {
    setTrack(id: string) {
      shape = seededShape(id);
      draw();
    },
    /** Redibujo puntual (seek / timeupdate en pausa). */
    refresh() {
      if (!running) draw();
    },
    start() {
      if (running) return;
      running = true;
      gsap.ticker.add(draw);
    },
    stop() {
      if (!running) return;
      running = false;
      gsap.ticker.remove(draw);
      smooth.fill(0);
      draw();
    },
    destroy() {
      this.stop();
      observer.disconnect();
    },
  };
}

export type Visualizer = NonNullable<ReturnType<typeof createVisualizer>>;
