import { gsap } from '@/lib/animations/gsap';
import { prefersReducedMotion, type Cleanup } from '@/lib/env';
import type { SmoothScroll } from '@/lib/scroll/smooth-scroll';

/**
 * Índice mobile (MobileMenu.astro):
 * - `<button>` real con `aria-expanded` / `aria-controls`;
 * - al abrir: bloquea el scroll de fondo, vuelve inerte el resto de la página
 *   (el foco no puede irse detrás) y enfoca el primer link;
 * - Escape o el mismo botón cierran y devuelven el foco al botón;
 * - tocar un link cierra el menú y deja que la navegación por anclas siga.
 */
export function initMobileMenu(scroll: SmoothScroll): Cleanup {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-mobile-menu]');
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  if (!toggle || !menu || !header) return () => {};

  const label = toggle.querySelector<HTMLElement>('[data-menu-label]');
  const background = () => document.querySelectorAll<HTMLElement>('#contenido, footer.outro, .skip-link');
  const desktop = window.matchMedia('(min-width: 48rem)');
  const abort = new AbortController();
  const { signal } = abort;
  let isOpen = false;

  const open = () => {
    if (isOpen) return;
    isOpen = true;
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    if (label) label.textContent = 'Cerrar';
    header.classList.add('is-menu-open');
    background().forEach((el) => (el.inert = true));
    scroll.lock();
    menu.querySelector<HTMLAnchorElement>('a')?.focus();
    if (!prefersReducedMotion()) {
      gsap.fromTo(
        menu.querySelectorAll('[data-menu-item]'),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', stagger: 0.045, overwrite: true },
      );
    }
  };

  const close = ({ restoreFocus }: { restoreFocus: boolean }) => {
    if (!isOpen) return;
    isOpen = false;
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    if (label) label.textContent = 'Menú';
    header.classList.remove('is-menu-open');
    background().forEach((el) => (el.inert = false));
    scroll.unlock();
    if (restoreFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => (isOpen ? close({ restoreFocus: true }) : open()), { signal });
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && isOpen) close({ restoreFocus: true });
    },
    { signal },
  );
  // Links: el menú se cierra antes de que lib/scroll/anchors.ts haga el scroll
  // (este listener está más cerca del link que el del documento).
  menu.addEventListener(
    'click',
    (event) => {
      if ((event.target as Element).closest('a')) close({ restoreFocus: false });
    },
    { signal },
  );
  desktop.addEventListener('change', (event) => event.matches && close({ restoreFocus: false }), { signal });

  return () => {
    close({ restoreFocus: false });
    abort.abort();
  };
}
