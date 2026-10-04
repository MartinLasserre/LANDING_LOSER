/**
 * Una sola experiencia sonora activa en todo el sitio.
 *
 * Cada fuente que puede sonar (el player de tracks, el video destacado) se
 * registra con su función de pausa. Cuando una empieza a sonar llama a
 * `claimMediaFocus(id)` y todas las demás se pausan.
 */
interface MediaOwner {
  id: string;
  pause: () => void;
}

const owners = new Set<MediaOwner>();

export function registerMediaOwner(owner: MediaOwner): () => void {
  owners.add(owner);
  return () => owners.delete(owner);
}

export function claimMediaFocus(id: string): void {
  owners.forEach((owner) => {
    if (owner.id !== id) owner.pause();
  });
}
