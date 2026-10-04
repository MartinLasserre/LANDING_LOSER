import { ScrollTrigger } from '@/lib/animations/gsap';
import type { Cleanup } from '@/lib/env';

/**
 * Estado del header: transparente sobre el hero, compacto fuera de él.
 * Es estado (clase CSS), no animación: la transición la hace CSS y con
 * reduced motion simplemente cambia sin transición.
 */
export function initHeaderState(): Cleanup {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!header || !hero) return () => {};

  const trigger = ScrollTrigger.create({
    start: () => Math.max(1, hero.offsetHeight - header.offsetHeight * 1.5),
    end: 'max',
    toggleClass: { targets: header, className: 'is-compact' },
  });
  return () => trigger.kill();
}
