import { ScrollTrigger } from '@/lib/animations/gsap';
import type { Cleanup } from '@/lib/env';

export interface SectionChange {
  id: string;
  /** Intensidad de atmósfera declarada con `data-atmosphere` (0–1). */
  atmosphere: number;
}

/**
 * Observa las secciones (`[data-section]`, con `data-section-index`,
 * `data-section-label` y `data-atmosphere`) con ScrollTrigger:
 * - marca el link activo de la navegación (`aria-current`);
 * - actualiza el indicador "00 Inicio" y la barra de progreso;
 * - notifica el cambio de escena (la atmósfera WebGL lo usa).
 * Funciona también con reduced motion: es estado, no animación.
 */
export function initSections(onChange: (change: SectionChange) => void): Cleanup {
  const sections = [...document.querySelectorAll<HTMLElement>('[data-section]')];
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-site-header] [data-nav-link]')];
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  const nowIndex = document.querySelector<HTMLElement>('[data-nav-now-index]');
  const nowLabel = document.querySelector<HTMLElement>('[data-nav-now-label]');

  let current = '';
  const activate = (section: HTMLElement) => {
    const id = section.dataset['section'] ?? '';
    if (id === current) return;
    current = id;

    links.forEach((link) => {
      if (link.dataset['navLink'] === id && id !== 'inicio') link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });

    if (nowIndex) nowIndex.textContent = section.dataset['sectionIndex'] ?? '—';
    if (nowLabel) nowLabel.textContent = section.dataset['sectionLabel'] ?? '';

    onChange({ id, atmosphere: Number(section.dataset['atmosphere'] ?? 0.6) });
  };

  const triggers = sections.map((section) =>
    ScrollTrigger.create({
      trigger: section,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => self.isActive && activate(section),
    }),
  );

  const progress = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => header?.style.setProperty('--progress', self.progress.toFixed(4)),
  });

  if (sections[0]) activate(sections[0]);

  return () => {
    triggers.forEach((t) => t.kill());
    progress.kill();
  };
}
