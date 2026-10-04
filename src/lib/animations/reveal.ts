import { gsap, ScrollTrigger, SplitText } from './gsap';
import type { Cleanup } from '@/lib/env';

/**
 * Reveals de entrada (sin scrub: una vez, al entrar al viewport).
 *   [data-reveal]        → sube y aparece
 *   [data-reveal-group]  → sus hijos aparecen en cascada
 *   [data-reveal-clip]   → la imagen se descubre de abajo hacia arriba
 * Llamar dentro de un contexto de gsap.matchMedia (motion): al revertir el
 * contexto, todo vuelve al estado del HTML.
 */
export function initReveals(): Cleanup {
  // Solo `opacity` (nunca visibility/autoAlpha): un elemento aún no revelado
  // tiene que seguir siendo enfocable con el teclado.
  const singles = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  gsap.set(singles, { opacity: 0, y: 28 });
  ScrollTrigger.batch(singles, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true }),
  });

  gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach((group) => {
    gsap.fromTo(
      group.children,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.07,
        scrollTrigger: { trigger: group, start: 'top 85%', once: true },
      },
    );
  });

  gsap.utils.toArray<HTMLElement>('[data-reveal-clip]').forEach((figure) => {
    const frame = figure.querySelector('.photo__frame');
    const img = figure.querySelector('img');
    if (!frame || !img) return;
    gsap
      .timeline({ scrollTrigger: { trigger: figure, start: 'top 85%', once: true } })
      .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.out' })
      .fromTo(img, { scale: 1.18 }, { scale: 1, duration: 1.6, ease: 'expo.out' }, 0);
  });

  // Red de seguridad: si el foco llega a algo todavía oculto, mostrarlo ya.
  const onFocusIn = (event: FocusEvent) => {
    const target = event.target as Element | null;
    const hidden = target?.closest<HTMLElement>('[data-reveal], [data-reveal-group] > *');
    if (hidden && Number(getComputedStyle(hidden).opacity) < 1) {
      gsap.to(hidden, { opacity: 1, y: 0, duration: 0.3, overwrite: true });
    }
  };
  document.addEventListener('focusin', onFocusIn);
  return () => document.removeEventListener('focusin', onFocusIn);
}

/**
 * Tipografía que se "lee" con el scroll: cada palabra pasa de apagada a
 * encendida mientras la frase atraviesa el viewport (scrub).
 */
export function initScrubText(): void {
  gsap.utils.toArray<HTMLElement>('[data-scrub-words]').forEach((el) => {
    SplitText.create(el, {
      type: 'words',
      // Partir en palabras no altera la lectura: sin atributos ARIA extra.
      aria: 'none',
      autoSplit: true,
      onSplit: (self) =>
        gsap.fromTo(
          self.words,
          { opacity: 0.14 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.12,
            scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: true },
          },
        ),
    });
  });
}
