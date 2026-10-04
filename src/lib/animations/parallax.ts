import { gsap } from './gsap';

/**
 * Sistema de parallax declarativo:
 *   data-parallax="0.1"     → desplazamiento vertical (fracción del alto del viewport)
 *   data-parallax-x="-0.2"  → desplazamiento horizontal (fracción del ancho)
 * Positivo: el elemento queda "atrás" (se mueve con el scroll, más lento).
 * Negativo: el elemento queda "adelante" (más rápido que el scroll).
 * `scale` permite reducir la distancia en mobile.
 */
export function initParallax({ scale = 1 }: { scale?: number } = {}): void {
  const axes = [
    { attr: 'data-parallax', prop: 'y', size: () => window.innerHeight },
    { attr: 'data-parallax-x', prop: 'x', size: () => window.innerWidth },
  ] as const;

  for (const { attr, prop, size } of axes) {
    gsap.utils.toArray<HTMLElement>(`[${attr}]`).forEach((el) => {
      const speed = Number(el.getAttribute(attr));
      if (!Number.isFinite(speed) || speed === 0) return;
      const distance = () => speed * size() * scale;
      gsap.fromTo(
        el,
        { [prop]: () => -distance() / 2 },
        {
          [prop]: () => distance() / 2,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    });
  }
}
