/** `163` → `2:43`. Seguro para valores no finitos (audio sin metadata). */
export function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0:00';
  const s = Math.floor(totalSeconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export interface ShowDateParts {
  day: string;
  month: string;
  year: string;
  weekday: string;
  /** Texto completo para lectores de pantalla. */
  long: string;
  isPast: boolean;
}

/**
 * Parsea una fecha ISO `AAAA-MM-DD` sin depender de la zona horaria del
 * servidor de build. `today` permite tests deterministas.
 */
export function parseShowDate(iso: string, locale: string, today = new Date()): ShowDateParts {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) throw new Error(`Fecha de show inválida: "${iso}" (formato AAAA-MM-DD)`);
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  const fmt = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...options }).format(date);
  const startOfToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return {
    day: String(d).padStart(2, '0'),
    month: fmt({ month: 'short' }).replace('.', ''),
    year: String(y),
    weekday: fmt({ weekday: 'short' }).replace('.', ''),
    long: fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    isPast: Date.UTC(y, m - 1, d) < startOfToday,
  };
}
