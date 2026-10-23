/** Geração e análise do cronograma semanal. */
import { addDays, diffDays, weekdayIndex, startOfWeek, type DateKey } from '../lib/dates';
import { createId, nowIso } from '../lib/utils';
import type { Discipline, StudySession, WeeklyPlan } from '../db/types';

export const MAX_BLOCK_MINUTES = 60;
export const SIMULADO_DISCIPLINE_ID = 'simulado';
export const SIMULADO_MINUTES = 240; // 4 horas

/** Divide os minutos semanais de uma disciplina em blocos de até 60 min (múltiplos de 5). */
export function splitIntoBlocks(minutes: number, maxBlock = MAX_BLOCK_MINUTES): number[] {
  if (minutes <= 0) return [];
  const count = Math.ceil(minutes / maxBlock);
  const base = Math.floor(minutes / count / 5) * 5;
  const blocks = Array.from({ length: count }, () => base);
  let remainder = minutes - base * count;
  for (let i = 0; remainder > 0; i = (i + 1) % count) {
    const add = Math.min(5, remainder);
    blocks[i] += add;
    remainder -= add;
  }
  return blocks.filter((b) => b > 0);
}

export interface PlannedBlock {
  date: DateKey;
  disciplineId: string;
  minutes: number;
}

/** Identifica se uma sessão é manual ou não deve ser substituída pelo gerador automático. */
export function isManualSession(s: StudySession): boolean {
  if (s.isManual) return true;
  if (s.origin === 'avulsa') return true;
  if (s.recoveredFromId !== null) return true;
  if (s.actualSeconds > 0) return true;
  if (s.history?.some((h) => h.type === 'editada' || h.type === 'reagendada')) return true;
  const firstEntry = s.history?.[0]?.description ?? '';
  if (firstEntry && !firstEntry.includes('cronograma')) {
    return true;
  }
  return false;
}

/**
 * Distribui os blocos de cada disciplina na semana:
 * - De segunda a sábado (dias 0 a 5): disciplinas regulares distribuídas e equilibradas.
 * - Todo domingo (dia 6): reservado exclusivamente para o simulado completo de 4h (240 min).
 * - Respeita sessões pré-criadas/manuais: deduz da carga semanal da disciplina e evita sobreposições.
 */
export function distributeWeek(
  weekStart: DateKey,
  distribution: Record<string, number>,
  disciplines: readonly Discipline[],
  includeSundaySimulado = true,
  existingSessions: readonly StudySession[] = [],
): PlannedBlock[] {
  const ordered = [...disciplines].filter((d) => d.active).sort((a, b) => a.order - b.order);

  // Deduz minutos já planejados/alocados em sessões existentes da semana para cada disciplina
  const items: Array<{ disciplineId: string; minutes: number; order: number }> = [];
  for (const d of ordered) {
    const alreadyPlanned = existingSessions
      .filter((s) => s.disciplineId === d.id)
      .reduce((sum, s) => sum + s.plannedMinutes, 0);
    const targetMinutes = distribution[d.id] ?? 0;
    const remainingMinutes = Math.max(0, targetMinutes - alreadyPlanned);

    for (const m of splitIntoBlocks(remainingMinutes)) {
      items.push({ disciplineId: d.id, minutes: m, order: d.order });
    }
  }
  items.sort((a, b) => b.minutes - a.minutes || a.order - b.order);

  // Segunda a sábado = 6 dias disponíveis para as disciplinas de estudo (exclui domingo quando includeSundaySimulado = true)
  const studyDayOffsets: number[] = [];
  let sundayOffset = 0;
  for (let offset = 0; offset < 7; offset++) {
    const dayDate = addDays(weekStart, offset);
    if (weekdayIndex(dayDate) === 0) {
      sundayOffset = offset;
      if (!includeSundaySimulado) {
        studyDayOffsets.push(offset);
      }
    } else {
      studyDayOffsets.push(offset);
    }
  }

  const availableDays = studyDayOffsets.length;
  const load = Array.from({ length: availableDays }, () => 0);
  const used = Array.from({ length: availableDays }, () => new Set<string>());

  // Inicializa carga e disciplinas já existentes nos dias para não sobrepor
  for (let i = 0; i < availableDays; i++) {
    const dayDate = addDays(weekStart, studyDayOffsets[i]);
    const dayExisting = existingSessions.filter((s) => s.date === dayDate);
    for (const s of dayExisting) {
      load[i] += s.plannedMinutes;
      used[i].add(s.disciplineId);
    }
  }

  const blocks: PlannedBlock[] = [];
  for (const item of items) {
    let best = -1;
    for (let i = 0; i < availableDays; i++) {
      const free = !used[i].has(item.disciplineId);
      if (best === -1) {
        best = i;
        continue;
      }
      const bestFree = !used[best].has(item.disciplineId);
      if (free !== bestFree) {
        if (free) best = i;
        continue;
      }
      if (load[i] < load[best]) best = i;
    }
    load[best] += item.minutes;
    used[best].add(item.disciplineId);
    blocks.push({
      date: addDays(weekStart, studyDayOffsets[best]),
      disciplineId: item.disciplineId,
      minutes: item.minutes,
    });
  }

  // Todo domingo terá apenas simulado com duração de 4h (240 min)
  if (includeSundaySimulado) {
    const sundayDate = addDays(weekStart, sundayOffset);
    const hasSundaySimulado = existingSessions.some(
      (s) => s.date === sundayDate && (s.disciplineId === SIMULADO_DISCIPLINE_ID || s.plannedMinutes >= SIMULADO_MINUTES),
    );
    if (!hasSundaySimulado) {
      blocks.push({
        date: sundayDate,
        disciplineId: SIMULADO_DISCIPLINE_ID,
        minutes: SIMULADO_MINUTES,
      });
    }
  }

  return blocks.sort((a, b) => a.date.localeCompare(b.date) || a.disciplineId.localeCompare(b.disciplineId));
}

export function blockToSession(block: PlannedBlock, objective = ''): StudySession {
  const now = nowIso();
  const isSimulado = block.disciplineId === SIMULADO_DISCIPLINE_ID;
  return {
    id: createId(),
    date: block.date,
    disciplineId: block.disciplineId,
    topicId: null,
    plannedStart: isSimulado ? '08:00' : null,
    plannedMinutes: block.minutes,
    actualSeconds: 0,
    status: 'planejada',
    objective: objective || (isSimulado ? 'Simulado Geral BNB (4h)' : ''),
    notes: isSimulado ? 'Simulado semanal completo com duração de 4 horas.' : '',
    origin: 'planejada',
    startedAt: null,
    endedAt: null,
    recoveredFromId: null,
    history: [
      {
        at: now,
        type: 'criada',
        description: isSimulado
          ? 'Simulado semanal de domingo (4h) gerado pelo cronograma.'
          : 'Criada pelo cronograma semanal.',
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

export function buildWeeklyPlans(startDate: DateKey, weeks: number, weeklyMinutes: number): WeeklyPlan[] {
  const baseWeekStart = startOfWeek(startDate);
  return Array.from({ length: weeks }, (_, i) => ({
    id: createId(),
    weekIndex: i + 1,
    weekStart: addDays(baseWeekStart, i * 7),
    objectives: 'Cronograma BNB TI (24 Semanas) — 2h diárias e sábado exclusivo de questões/simulado.',
    plannedContent: '',
    plannedMinutes: weeklyMinutes,
    status: 'pendente' as const,
    notes: '',
  }));
}

/** Número da semana (1..n) do cronograma para uma data, ou `null` se fora. */
export function weekIndexForDate(startDate: DateKey | null, date: DateKey, weeks: number): number | null {
  if (!startDate) return null;
  const baseWeekStart = startOfWeek(startDate);
  const diff = diffDays(date, baseWeekStart);
  if (diff < 0) return null;
  const idx = Math.floor(diff / 7) + 1;
  return idx <= weeks ? idx : null;
}

export interface OverloadInfo {
  /** Dias cuja carga planejada excede a meta diária. */
  overloadedDays: Array<{ date: DateKey; minutes: number }>;
  weekMinutes: number;
  weekOverloaded: boolean;
}

export function detectOverload(
  sessions: readonly StudySession[],
  weekStart: DateKey,
  dailyGoalMinutes: number,
  weeklyGoalMinutes: number,
): OverloadInfo {
  const perDay = new Map<DateKey, number>();
  let weekMinutes = 0;
  const end = addDays(weekStart, 6);
  for (const s of sessions) {
    if (s.status !== 'planejada' || s.date < weekStart || s.date > end) continue;
    perDay.set(s.date, (perDay.get(s.date) ?? 0) + s.plannedMinutes);
    weekMinutes += s.plannedMinutes;
  }
  let sunday = weekStart;
  for (let offset = 0; offset < 7; offset++) {
    const d = addDays(weekStart, offset);
    if (weekdayIndex(d) === 0) {
      sunday = d;
      break;
    }
  }
  const overloadedDays = [...perDay.entries()]
    .filter(([date, minutes]) => {
      // No domingo com simulado de 4h (240 min), não gera alerta de sobrecarga diária
      if (date === sunday) {
        return minutes > Math.max(dailyGoalMinutes, SIMULADO_MINUTES);
      }
      return minutes > dailyGoalMinutes;
    })
    .map(([date, minutes]) => ({ date, minutes }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const hasSundaySimulado = sessions.some(
    (s) => s.status === 'planejada' && s.date === sunday && s.disciplineId === SIMULADO_DISCIPLINE_ID,
  );
  const effectiveWeeklyGoal = hasSundaySimulado ? weeklyGoalMinutes + SIMULADO_MINUTES : weeklyGoalMinutes;

  return { overloadedDays, weekMinutes, weekOverloaded: weekMinutes > effectiveWeeklyGoal };
}

export function sumDistribution(distribution: Record<string, number>, disciplines: readonly Discipline[]): number {
  return disciplines.filter((d) => d.active).reduce((sum, d) => sum + (distribution[d.id] ?? 0), 0);
}
