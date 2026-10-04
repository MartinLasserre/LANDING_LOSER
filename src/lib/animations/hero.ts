import { gsap, SplitText } from './gsap';
import { glitchOnce } from './glitch';

export interface HeroHooks {
  /** Progreso del scroll del hero (0–1). */
  onProgress?: (progress: number) => void;
  /** Momento de impacto de la entrada. */
  onImpact?: () => void;
}

/**
 * Hero — "the first hit".
 * Entrada: la foto se descubre, las letras suben desde su línea y el nombre
 * hace un único glitch. Scroll: cada capa se mueve a distinta velocidad y
 * en distinta dirección para construir profundidad (no todo a la vez).
 */
export function initHero(hooks: HeroHooks = {}): void {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;

  const media = hero.querySelector<HTMLElement>('[data-hero-media]');
  const figure = media?.querySelector<HTMLElement>('.photo');
  const title = hero.querySelector<HTMLElement>('[data-hero-title]');
  const lines = gsap.utils.toArray<HTMLElement>('[data-hero-line]', hero);
  const inners = lines.map((l) => l.querySelector<HTMLElement>('.hero__line-inner')).filter((el) => el !== null);
  const metas = gsap.utils.toArray<HTMLElement>('[data-hero-meta]', hero);
  const scrollCue = hero.querySelector<HTMLElement>('[data-hero-scroll]');
  const texture = hero.querySelector<HTMLElement>('[data-hero-texture]');

  // ── Entrada ──────────────────────────────────────────
  // Las líneas vuelven a su lugar y las letras toman su desplazamiento
  // inicial en el mismo frame (sin parpadeo).
  // El <h1> lleva aria-label en el HTML; las letras se ocultan a lectores.
  const split = SplitText.create(inners, { type: 'chars', aria: 'hidden' });
  gsap.set(inners, { yPercent: 0, y: 0 });
  gsap.set(split.chars, { yPercent: 135 });

  // La intro espera a la fuente display (máx. 1s): las letras siguen
  // recortadas fuera de su línea, así el swap de fuente no produce CLS.
  const intro = gsap.timeline({ defaults: { ease: 'expo.out' }, paused: true });
  const fontReady = document.fonts?.load(`850 1em ${getComputedStyle(title ?? hero).fontFamily}`) ?? Promise.resolve();
  void Promise.race([fontReady, new Promise((resolve) => setTimeout(resolve, 1000))])
    .catch(() => undefined)
    .then(() => intro.play());
  if (figure) {
    intro.fromTo(
      figure,
      { clipPath: 'inset(22% 8% 30% 8%)', scale: 1.14 },
      { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.8 },
      0,
    );
  }
  intro
    .to(split.chars, { yPercent: 0, duration: 1.1, stagger: 0.035 }, 0.15)
    .add(() => {
      glitchOnce(title);
      hooks.onImpact?.();
    }, 0.95)
    .to(metas, { autoAlpha: 1, duration: 0.8, stagger: 0.08, ease: 'power2.out' }, 0.8);
  if (scrollCue) intro.to(scrollCue, { autoAlpha: 1, duration: 0.6 }, 1.1);

  // ── Scroll: profundidad por capas ────────────────────
  const scroll = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      ...(hooks.onProgress && { onUpdate: (self) => hooks.onProgress?.(self.progress) }),
    },
  });

  if (media) scroll.to(media, { yPercent: 22, scale: 1.06 }, 0);
  if (lines[0]) scroll.to(lines[0], { xPercent: -14 }, 0);
  if (lines[1]) scroll.to(lines[1], { xPercent: 12 }, 0);
  if (title) scroll.to(title, { yPercent: -30 }, 0);
  // fromTo + immediateRender:false: el estado "visible" es el de después de
  // la intro, no el inicial oculto (si no, al volver arriba quedarían ocultos).
  if (scrollCue) {
    scroll.fromTo(scrollCue, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.15, immediateRender: false }, 0);
  }
  scroll.fromTo(
    metas,
    { autoAlpha: 1, y: 0 },
    { autoAlpha: 0, y: -40, duration: 0.4, stagger: 0.05, immediateRender: false },
    0.02,
  );
  if (texture) scroll.to(texture, { opacity: 0.4, duration: 1 }, 0);
  scroll.fromTo(document.documentElement, { '--grain-opacity': 0.075 }, { '--grain-opacity': 0.12, duration: 1 }, 0);
}
