import { gsap } from './gsap';

export interface ArchiveOptions {
  /** Alto de scroll por cuadro, en fracciones de viewport (mobile < desktop). */
  stepVh: number;
  /** Cambio de escena (bloque negro). */
  onBlackout?: () => void;
}

/**
 * 02 — Archivo pinned.
 * El escenario se fija; cada cuadro del rollo entra recortándose desde
 * abajo mientras el anterior se aparta (escala + giro, como copias
 * apiladas). Al final el último cuadro inunda la pantalla y un bloque
 * negro cierra la escena antes de Música.
 */
export function initArchive({ stepVh, onBlackout }: ArchiveOptions): void {
  const stage = document.querySelector<HTMLElement>('[data-archive-stage]');
  if (!stage) return;

  const frames = gsap.utils.toArray<HTMLElement>('[data-archive-frame]', stage);
  const lines = gsap.utils.toArray<HTMLElement>('[data-archive-line]', stage);
  const counter = stage.querySelector<HTMLElement>('[data-archive-counter]');
  const head = stage.querySelector<HTMLElement>('.archive__head');
  const flood = stage.querySelector<HTMLElement>('[data-archive-flood]');
  const floodImg = flood?.querySelector('img');
  const blackout = stage.querySelector<HTMLElement>('[data-archive-blackout]');
  const closing = stage.querySelector<HTMLElement>('[data-archive-closing]');
  if (frames.length === 0) return;

  const pad = (n: number) => String(n).padStart(2, '0');
  let shown = 1;
  const steps = frames.length + 2; // cuadros + inundación + cierre

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      end: () => `+=${steps * stepVh * window.innerHeight}`,
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
    // En el timeline (no en el ScrollTrigger): con scrub, el timeline sigue
    // avanzando unos instantes después de que el scroll se detiene.
    onUpdate: () => {
      const time = tl.time();
      const index = 1 + frames.slice(1).filter((_, i) => time >= (tl.labels[`frame${i + 1}`] ?? Infinity) + 0.5).length;
      if (index !== shown && counter) {
        shown = index;
        counter.textContent = pad(index);
      }
    },
  });

  gsap.set(frames.slice(1), { autoAlpha: 1, clipPath: 'inset(100% 0% 0% 0%)' });
  gsap.set(lines.slice(1), { autoAlpha: 0, yPercent: 60 });
  gsap.set(lines[0] ?? [], { autoAlpha: 1 });

  tl.to({}, { duration: 0.4 }); // respiro inicial con el primer cuadro

  frames.forEach((frame, i) => {
    if (i === 0) return;
    const prev = frames[i - 1];
    tl.addLabel(`frame${i}`)
      .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)', yPercent: 8 }, { clipPath: 'inset(0% 0% 0% 0%)', yPercent: 0, duration: 1 })
      .to(prev ?? [], { scale: 0.84, rotation: i % 2 ? -4 : 3, autoAlpha: 0.3, duration: 1 }, '<')
      .to(lines[i - 1] ?? [], { yPercent: -60, autoAlpha: 0, duration: 0.45 }, '<')
      .to(lines[i] ?? [], { yPercent: 0, autoAlpha: 1, duration: 0.45 }, '<0.45')
      .to({}, { duration: 0.5 });
  });

  if (flood && floodImg) {
    tl.addLabel('flood')
      .set(flood, { autoAlpha: 1 })
      .fromTo(flood, { clipPath: 'inset(24% 34% 24% 34%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2 })
      .fromTo(floodImg, { scale: 1.35 }, { scale: 1, duration: 1.2 }, '<')
      .to([head, counter, lines.at(-1)].filter((el) => el != null), { autoAlpha: 0, duration: 0.4 }, '<');
  }

  if (blackout) {
    tl.addLabel('blackout')
      .to(blackout, { autoAlpha: 1, duration: 0.7 }, '+=0.25')
      .call(() => onBlackout?.(), [], '<0.3');
    if (closing) tl.fromTo(closing, { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6 }, '<0.2');
    tl.to({}, { duration: 0.6 });
  }
}
