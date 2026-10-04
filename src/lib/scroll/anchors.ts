import type { Cleanup } from '@/lib/env';
import type { SmoothScroll } from './smooth-scroll';

/**
 * Links internos (`href="#id"`): scroll suave vía el sistema central,
 * hash en la URL y foco en el destino para que la navegación por teclado
 * y lectores de pantalla continúen desde la sección correcta.
 */
export function initAnchors(scroll: SmoothScroll): Cleanup {
  const focusTarget = (el: HTMLElement) => {
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  };

  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    const id = decodeURIComponent(link.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (!target) return;

    event.preventDefault();
    const isTop = target.id === 'inicio';
    scroll.scrollTo(isTop ? 0 : target, { onComplete: () => focusTarget(target) });
    history.pushState(null, '', isTop ? location.pathname + location.search : `#${id}`);
  };

  // Atrás/adelante entre hashes.
  const onPopState = () => {
    const id = location.hash.slice(1);
    const target = id ? document.getElementById(id) : null;
    scroll.scrollTo(target ?? 0);
  };

  document.addEventListener('click', onClick);
  window.addEventListener('popstate', onPopState);
  return () => {
    document.removeEventListener('click', onClick);
    window.removeEventListener('popstate', onPopState);
  };
}

/**
 * Tras crear las secciones pinned el layout cambia: si la página se abrió
 * con un hash, volver a posicionarse en su destino real.
 */
export function restoreHashPosition(scroll: SmoothScroll): void {
  const id = location.hash.slice(1);
  const target = id ? document.getElementById(decodeURIComponent(id)) : null;
  if (target) scroll.scrollTo(target, { immediate: true });
}
