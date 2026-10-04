import { gsap } from './gsap';

/**
 * 04 — Video. El cuadro entra chico y crece con el scroll hasta casi ocupar
 * el viewport; el título gigante, detrás, se mueve a otra velocidad. Al
 * salir, el cuadro se repliega y se apaga apenas: deja paso al archivo de
 * fechas. En mobile el gesto es corto y sin repliegue.
 */
export function initVideoScene({ desktop }: { desktop: boolean }): void {
  const stage = document.querySelector<HTMLElement>('[data-video-stage]');
  const frame = stage?.querySelector<HTMLElement>('[data-video-frame]');
  const title = stage?.querySelector<HTMLElement>('[data-video-title]');
  if (!stage || !frame || !title) return;

  if (!desktop) {
    gsap.fromTo(
      frame,
      { scale: 0.9 },
      { scale: 1, ease: 'none', scrollTrigger: { trigger: frame, start: 'top 95%', end: 'top 45%', scrub: true } },
    );
    return;
  }

  gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: stage, start: 'top 90%', end: 'center center', scrub: true },
    })
    .fromTo(frame, { scale: 0.58 }, { scale: 1 }, 0)
    .fromTo(title, { yPercent: 45 }, { yPercent: -10 }, 0);

  gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: stage, start: 'bottom 75%', end: 'bottom top', scrub: true },
    })
    .to(frame, { scale: 0.88, opacity: 0.45 }, 0)
    .to(title, { opacity: 0.25 }, 0);
}
