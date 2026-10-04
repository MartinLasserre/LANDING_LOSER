import { gsap, ScrollTrigger } from './gsap';

/**
 * Flyers del archivo En vivo: entran desde abajo, algo girados, en cascada
 * (un solo `ScrollTrigger.batch` para toda la pared). La inclinación final
 * la da el CSS (`rotate: var(--tilt)`), independiente de este transform.
 */
export function initLiveArchive(): void {
  const flyers = gsap.utils.toArray<HTMLElement>('[data-flyer]');
  if (flyers.length === 0) return;

  gsap.set(flyers, { opacity: 0, y: 80, rotation: (i: number) => (i % 2 ? 5 : -5) });
  ScrollTrigger.batch(flyers, {
    start: 'top 92%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { opacity: 1, y: 0, rotation: 0, duration: 1, ease: 'expo.out', stagger: 0.12, overwrite: true }),
  });
}
