/** Formatação numérica e de duração em pt-BR. */

const percentFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
const integerFormatter = new Intl.NumberFormat('pt-BR');

export const EMPTY_VALUE = '—';

/** Formata minutos como "1h 30min", "45min" ou "0min". */
export function formatMinutes(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${String(m).padStart(2, '0')}min`;
}

/** Formata segundos como HH:MM:SS. */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((v) => String(v).padStart(2, '0')).join(':');
}

/** Formata percentual (0-100). `null` vira "—". */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return EMPTY_VALUE;
  return `${percentFormatter.format(value)}%`;
}

export function formatInteger(value: number): string {
  return integerFormatter.format(value);
}

export function plural(count: number, singular: string, pluralForm: string): string {
  return `${formatInteger(count)} ${count === 1 ? singular : pluralForm}`;
}

export function secondsToMinutes(seconds: number): number {
  return Math.round(seconds / 60);
}
