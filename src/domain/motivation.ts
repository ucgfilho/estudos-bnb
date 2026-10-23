/**
 * Motivação e reforço positivo baseados em evidências.
 *
 * Fundamentos aplicados (resumo — ver README, seção "Motivação"):
 * - Goal-gradient (Hull 1932; Kivetz, Urminsky & Zheng 2006): o esforço acelera
 *   conforme a meta se aproxima → progresso sempre visível.
 * - Small-area hypothesis (Koo & Fishbach 2012): no início enfatizar o que já
 *   foi feito; depois da metade, enfatizar o pouco que falta.
 * - Reward prediction error (Schultz 1997): recompensas inesperadas/variáveis
 *   geram mais dopamina que as previsíveis → mensagens e intensidade variáveis,
 *   marcos raros (recorde pessoal, 100%) celebrados com mais ênfase.
 * - Progress principle (Amabile & Kramer 2011): pequenas vitórias sinalizadas
 *   sustentam a motivação → cada sessão concluída é reconhecida.
 * - Self-Determination Theory (Deci & Ryan): feedback informacional de
 *   competência (comparações com o próprio histórico), sem tom controlador.
 */
import type { QuestionLog, Settings, StudySession } from '../db/types';
import { addDays, type DateKey } from '../lib/dates';
import { accuracy, plannedSessions, studiedMinutesInRange, studyStreak } from './metrics';

/* ------------------------------------------------------------------ */
/* Progresso do dia                                                    */
/* ------------------------------------------------------------------ */

export interface DailyProgress {
  studiedMinutes: number;
  goalMinutes: number;
  /** 0..n (pode ultrapassar 1). */
  ratio: number;
  /** Blocos do cronograma planejados para hoje (sem substituídos). */
  scheduled: StudySession[];
  scheduledDone: number;
  questionsToday: number;
  questionGoal: number | null;
}

export function dailyProgress(
  sessions: readonly StudySession[],
  logs: readonly QuestionLog[],
  settings: Pick<Settings, 'dailyGoalMinutes' | 'dailyQuestionGoal'> | undefined,
  today: DateKey,
): DailyProgress {
  const goalMinutes = settings?.dailyGoalMinutes ?? 120;
  const studiedMinutes = studiedMinutesInRange(sessions, today, today);
  const scheduled = plannedSessions(sessions)
    .filter((s) => s.date === today)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.plannedStart ?? '99:99').localeCompare(b.plannedStart ?? '99:99'));
  return {
    studiedMinutes,
    goalMinutes,
    ratio: goalMinutes > 0 ? studiedMinutes / goalMinutes : 0,
    scheduled,
    scheduledDone: scheduled.filter((s) => s.status === 'concluida').length,
    questionsToday: logs.filter((l) => l.date === today).reduce((sum, l) => sum + l.total, 0),
    questionGoal: settings?.dailyQuestionGoal ?? null,
  };
}

/**
 * Mensagem de progresso com enquadramento dinâmico (Koo & Fishbach 2012):
 * abaixo de 50% destaca o acumulado; a partir de 50% destaca o que falta.
 */
export function progressFraming(studied: number, goal: number): string {
  const done = Math.round(studied);
  if (goal <= 0) return `${done} min estudados hoje.`;
  if (done >= goal) return 'Meta diária cumprida. Todo minuto extra agora é vantagem competitiva.';
  const remaining = Math.max(1, Math.round(goal - studied));
  if (done === 0) return 'O primeiro bloco é o mais difícil. Comece com 25 minutos.';
  if (studied / goal < 0.5) return `Você já acumulou ${done} min hoje. Bom ritmo, continue.`;
  if (remaining <= 15) return `Faltam só ${remaining} min para fechar a meta de hoje.`;
  return `Mais da metade feita. Faltam ${remaining} min para a meta.`;
}

/* ------------------------------------------------------------------ */
/* Conquistas (eventos de celebração)                                 */
/* ------------------------------------------------------------------ */

export type AchievementKind =
  | 'session-complete'
  | 'daily-goal'
  | 'schedule-complete'
  | 'question-goal'
  | 'questions-great'
  | 'questions-perfect'
  | 'personal-best'
  | 'streak-milestone'
  | 'questions-logged';

/** `big` = marco raro (mais ênfase); `small` = pequena vitória; `info` = feedback sem festa. */
export type AchievementTier = 'big' | 'small' | 'info';

export interface Achievement {
  kind: AchievementKind;
  tier: AchievementTier;
  /** Dado objetivo exibido como "chip" (feedback informacional). */
  detail?: string;
  disciplineId?: string;
}

const TIER_WEIGHT: Record<AchievementTier, number> = { big: 3, small: 2, info: 1 };
const KIND_PRIORITY: AchievementKind[] = [
  'schedule-complete',
  'personal-best',
  'questions-perfect',
  'daily-goal',
  'streak-milestone',
  'question-goal',
  'questions-great',
  'session-complete',
  'questions-logged',
];

export const STREAK_MILESTONES = [3, 7, 14, 21, 30, 45, 60, 90, 120] as const;

/** Mínimo de questões corrigidas para considerar um desempenho significativo. */
export const MIN_GRADED_FOR_CELEBRATION = 5;

/** Acima deste número de novidades simultâneas, trata-se de importação em massa. */
export const BULK_CHANGE_LIMIT = 3;

/** Instantâneo do estado relevante para detectar transições. */
export interface MotivationSnapshot {
  today: DateKey;
  dailyGoalReached: boolean;
  scheduleComplete: boolean;
  questionGoalReached: boolean;
  streak: number;
  completedSessionIds: Set<string>;
  logIds: Set<string>;
}

export function snapshot(
  sessions: readonly StudySession[],
  logs: readonly QuestionLog[],
  settings: Pick<Settings, 'dailyGoalMinutes' | 'dailyQuestionGoal'> | undefined,
  today: DateKey,
): MotivationSnapshot {
  const p = dailyProgress(sessions, logs, settings, today);
  return {
    today,
    dailyGoalReached: p.goalMinutes > 0 && p.studiedMinutes >= p.goalMinutes,
    scheduleComplete: p.scheduled.length > 0 && p.scheduledDone === p.scheduled.length,
    questionGoalReached: p.questionGoal !== null && p.questionGoal > 0 && p.questionsToday >= p.questionGoal,
    streak: studyStreak(sessions, today),
    completedSessionIds: new Set(sessions.filter((s) => s.status === 'concluida' && s.actualSeconds > 0).map((s) => s.id)),
    logIds: new Set(logs.map((l) => l.id)),
  };
}

/** Avalia um lançamento de questões recém-criado contra o histórico do próprio aluno. */
export function evaluateQuestionLog(log: QuestionLog, previousLogs: readonly QuestionLog[], accuracyGoal: number): Achievement[] {
  const graded = log.correct + log.incorrect;
  const acc = accuracy(log.correct, log.incorrect);
  const result: Achievement[] = [];
  if (acc === null) return result;
  const detail = `${log.correct}/${graded} acertos (${Math.round(acc)}%)`;

  if (graded < MIN_GRADED_FOR_CELEBRATION) {
    if (acc >= accuracyGoal) result.push({ kind: 'questions-great', tier: 'small', detail, disciplineId: log.disciplineId });
    else result.push({ kind: 'questions-logged', tier: 'info', detail, disciplineId: log.disciplineId });
    return result;
  }

  if (acc >= 100) result.push({ kind: 'questions-perfect', tier: 'big', detail, disciplineId: log.disciplineId });
  else if (acc >= accuracyGoal) result.push({ kind: 'questions-great', tier: 'small', detail, disciplineId: log.disciplineId });

  const history = previousLogs.filter(
    (l) => l.id !== log.id && l.disciplineId === log.disciplineId && l.correct + l.incorrect >= MIN_GRADED_FOR_CELEBRATION,
  );
  if (history.length > 0) {
    const best = Math.max(...history.map((l) => accuracy(l.correct, l.incorrect) ?? 0));
    if (acc > best && acc < 100) {
      result.push({ kind: 'personal-best', tier: 'big', detail: `Recorde na disciplina: ${Math.round(acc)}% (antes ${Math.round(best)}%)`, disciplineId: log.disciplineId });
    }
  }

  if (result.length === 0) result.push({ kind: 'questions-logged', tier: 'info', detail, disciplineId: log.disciplineId });
  return result;
}

/** Compara dois instantâneos e devolve as conquistas obtidas na transição. */
export function detectAchievements(
  prev: MotivationSnapshot,
  next: MotivationSnapshot,
  sessions: readonly StudySession[],
  logs: readonly QuestionLog[],
  accuracyGoal: number,
): Achievement[] {
  const found: Achievement[] = [];
  const sameDay = prev.today === next.today;

  const newlyCompleted = sessions.filter((s) => next.completedSessionIds.has(s.id) && !prev.completedSessionIds.has(s.id));
  const newLogs = logs.filter((l) => !prev.logIds.has(l.id));
  // Mudanças em massa (restauração de backup, importação) não são conquistas.
  if (newlyCompleted.length > BULK_CHANGE_LIMIT || newLogs.length > BULK_CHANGE_LIMIT) return found;

  for (const s of newlyCompleted) {
    found.push({ kind: 'session-complete', tier: 'small', detail: `+${Math.max(1, Math.round(s.actualSeconds / 60))} min`, disciplineId: s.disciplineId });
  }

  if (sameDay && !prev.dailyGoalReached && next.dailyGoalReached) found.push({ kind: 'daily-goal', tier: 'big' });
  if (sameDay && !prev.scheduleComplete && next.scheduleComplete) found.push({ kind: 'schedule-complete', tier: 'big' });
  if (sameDay && !prev.questionGoalReached && next.questionGoalReached) found.push({ kind: 'question-goal', tier: 'big' });

  if (next.streak > prev.streak) {
    const milestone = STREAK_MILESTONES.find((m) => prev.streak < m && next.streak >= m);
    if (milestone) found.push({ kind: 'streak-milestone', tier: 'big', detail: `${next.streak} dias seguidos` });
  }

  const previous = logs.filter((l) => prev.logIds.has(l.id));
  for (const log of newLogs) {
    found.push(...evaluateQuestionLog(log, previous, accuracyGoal));
  }

  return found;
}

/** Escolhe a conquista principal (maior nível e prioridade). */
export function primaryAchievement(list: readonly Achievement[]): Achievement | null {
  if (list.length === 0) return null;
  return [...list].sort(
    (a, b) => TIER_WEIGHT[b.tier] - TIER_WEIGHT[a.tier] || KIND_PRIORITY.indexOf(a.kind) - KIND_PRIORITY.indexOf(b.kind),
  )[0];
}

export function highestTier(list: readonly Achievement[]): AchievementTier | null {
  return primaryAchievement(list)?.tier ?? null;
}

/* ------------------------------------------------------------------ */
/* Mensagens variáveis (evitam habituação)                             */
/* ------------------------------------------------------------------ */

const MESSAGES: Record<AchievementKind, { title: string[]; body: string[] }> = {
  'session-complete': {
    title: ['Sessão concluída', 'Bloco fechado', 'Mais um bloco no histórico', 'Foco convertido em progresso'],
    body: [
      'Cada sessão concluída aproxima você da aprovação.',
      'Consistência vence intensidade. Ótimo trabalho.',
      'Registre as questões agora, enquanto o conteúdo está fresco.',
      'Uma pausa curta agora ajuda a render mais no próximo bloco.',
    ],
  },
  'daily-goal': {
    title: ['Meta diária batida', 'Meta do dia cumprida', 'Dia ganho'],
    body: [
      'Você cumpriu o tempo de estudo planejado para hoje.',
      'Meta atingida. O que vier a partir daqui é vantagem sobre a concorrência.',
      'Hoje o plano saiu do papel. Amanhã, repita.',
    ],
  },
  'schedule-complete': {
    title: ['Cronograma do dia completo', 'Todos os blocos de hoje concluídos', 'Dia 100% executado'],
    body: [
      'Você executou todos os blocos planejados para hoje.',
      'Plano cumprido por inteiro. Esse é o hábito que aprova.',
      'Nenhum bloco ficou para trás hoje. Excelente disciplina.',
    ],
  },
  'question-goal': {
    title: ['Meta de questões batida', 'Cota diária de questões cumprida'],
    body: ['Você atingiu a meta diária de questões.', 'Volume de questões em dia. É assim que se fixa o conteúdo.'],
  },
  'questions-great': {
    title: ['Ótimo desempenho', 'Acima da meta', 'Mandou bem'],
    body: [
      'Desempenho acima da sua meta de acerto.',
      'Essa matéria está ficando sólida.',
      'Seu estudo está se convertendo em acertos.',
    ],
  },
  'questions-perfect': {
    title: ['Gabaritou', '100% de acerto', 'Bateria perfeita'],
    body: ['Nenhum erro nesta bateria. Domínio demonstrado.', 'Acerto total. Considere aumentar a dificuldade.'],
  },
  'personal-best': {
    title: ['Novo recorde pessoal', 'Você superou sua melhor marca', 'Recorde quebrado'],
    body: ['Seu melhor desempenho já registrado nesta disciplina.', 'Evolução comprovada pelos seus próprios números.'],
  },
  'streak-milestone': {
    title: ['Sequência em alta', 'Marco de constância', 'Hábito consolidado'],
    body: ['Dias consecutivos de estudo constroem o hábito que aprova.', 'Constância é o seu diferencial. Não quebre a corrente.'],
  },
  'questions-logged': {
    title: ['Questões registradas', 'Bateria registrada'],
    body: [
      'Cada erro é um ponto de revisão mapeado. Anote os principais no Caderno de Erros.',
      'Errar no treino é o que evita errar na prova. Revise os erros hoje.',
    ],
  },
};

/** Seleciona título e mensagem de forma variável. `random` injetável para testes. */
export function pickMessage(kind: AchievementKind, random: () => number = Math.random): { title: string; body: string } {
  const pool = MESSAGES[kind];
  const pick = (arr: string[]) => arr[Math.floor(random() * arr.length) % arr.length];
  return { title: pick(pool.title), body: pick(pool.body) };
}

/** Comparativo opcional com ontem (feedback informacional surpresa). */
export function comparedToYesterday(sessions: readonly StudySession[], today: DateKey): string | null {
  const yesterday = addDays(today, -1);
  const t = studiedMinutesInRange(sessions, today, today);
  const y = studiedMinutesInRange(sessions, yesterday, yesterday);
  if (y <= 0 || t <= y) return null;
  return `+${Math.round(t - y)} min a mais que ontem`;
}

/** Próximo bloco pendente do cronograma de hoje (combate o "reset pós-recompensa"). */
export function nextPendingToday(sessions: readonly StudySession[], today: DateKey): StudySession | null {
  return (
    plannedSessions(sessions)
      .filter((s) => s.date === today && s.status === 'planejada')
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.plannedStart ?? '99:99').localeCompare(b.plannedStart ?? '99:99'))[0] ?? null
  );
}
