import { gsap, ScrollTrigger } from './gsap';
import { MEDIA, type Cleanup } from '@/lib/env';
import { initHero, type HeroHooks } from './hero';
import { initReveals, initScrubText } from './reveal';
import { initParallax } from './parallax';
import { initArchive } from './archive';
import { initOutro } from './outro';
import { initVideoScene } from './video';
import { initLiveArchive } from './live-archive';

export interface MotionHooks {
  hero?: HeroHooks;
  onSceneChange?: () => void;
}

/**
 * Motion system. Todo se registra dentro de `gsap.matchMedia()`:
 * - si el usuario activa reduced-motion (incluso en vivo) los contextos se
 *   revierten solos y el contenido vuelve a su estado HTML visible;
 * - mobile y desktop reciben distancias/duraciones distintas.
 * Los triggers se crean en orden de documento (importa para los pins).
 */
export function initMotion(hooks: MotionHooks = {}): Cleanup {
  const root = document.documentElement;
  const mm = gsap.matchMedia();

  // Reduced motion (también si se activa en vivo): layout estático visible.
  mm.add(MEDIA.reduced, () => {
    root.classList.remove('motion');
  });

  // Entrada y reveals: independientes del tamaño (no se repiten al redimensionar).
  mm.add(MEDIA.motion, () => {
    root.classList.add('motion');
    initHero(hooks.hero);
    initScrubText();
    const offReveals = initReveals();
    initLiveArchive();
    initOutro();
    return offReveals;
  });

  // Distancias y duración del pin según escala.
  mm.add({ motion: MEDIA.motion, desktop: MEDIA.desktop }, (context) => {
    const { motion, desktop } = context.conditions as { motion: boolean; desktop: boolean };
    if (!motion) return;
    initParallax({ scale: desktop ? 1 : 0.5 });
    initArchive({
      stepVh: desktop ? 0.75 : 0.55,
      ...(hooks.onSceneChange && { onBlackout: hooks.onSceneChange }),
    });
    initVideoScene({ desktop });
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  });

  return () => mm.revert();
}
