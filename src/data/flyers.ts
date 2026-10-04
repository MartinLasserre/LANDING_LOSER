import type { ImageMetadata } from 'astro';

/**
 * Flyers de conciertos: se dejan en `src/assets/flyers/` y se referencian
 * por nombre de archivo desde `site.ts` (`flyer: '2026-05-12-lugar.jpg'`).
 * Astro los optimiza en build (dimensiones reales → sin CLS). Si el archivo
 * no existe, el build falla con un mensaje claro en vez de publicar un link roto.
 */
const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/flyers/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
});

export function flyer(fileName: string): ImageMetadata {
  const match = files[`/src/assets/flyers/${fileName}`];
  if (!match) {
    const available = Object.keys(files).map((k) => k.split('/').pop());
    throw new Error(
      `[flyers] No existe src/assets/flyers/${fileName}. Disponibles: ${available.join(', ') || '(ninguno)'}`,
    );
  }
  return match.default;
}
