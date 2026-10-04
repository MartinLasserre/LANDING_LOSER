import { gsap } from './gsap';

/**
 * Outro: las dos palabras del nombre, que en el hero se separaban al
 * scrollear, vuelven a juntarse al llegar al final. Cierre del show.
 */
export function initOutro(): void {
  const name = document.querySelector<HTMLElement>('[data-outro-name]');
  if (!name) return;
  const [first, second] = gsap.utils.toArray<HTMLElement>('.outro__word', name);

  gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: name, start: 'top bottom', end: 'bottom bottom', scrub: true },
    })
    .fromTo(first ?? [], { xPercent: -18, opacity: 0.2 }, { xPercent: 0, opacity: 1 }, 0)
    .fromTo(second ?? [], { xPercent: 18, opacity: 0.2 }, { xPercent: 0, opacity: 1 }, 0);
}
