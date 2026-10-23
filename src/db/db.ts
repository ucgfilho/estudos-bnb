import { Dexie, type EntityTable } from 'dexie';
import { addDays, startOfWeek, weekdayIndex } from '../lib/dates';
import type {
  Discipline,
  ErrorNote,
  MockExam,
  QuestionLog,
  ReviewTask,
  Settings,
  StudySession,
  TimerState,
  Topic,
  WeeklyPlan,
} from './types';
import { SETTINGS_ID } from './types';
import { DEFAULT_DISCIPLINES, DEFAULT_SETTINGS } from './seed';

export const DB_NAME = 'bnb-estudos';

/**
 * Versão atual do schema de armazenamento.
 * Estratégia de migração: cada nova versão adiciona um bloco
 * `db.version(N).stores(...).upgrade(...)` mantendo os anteriores; o Dexie
 * aplica as migrações em sequência ao abrir o banco. Backups JSON carregam
 * `schemaVersion` e passam por `migrateBackup` antes da importação.
 */
export const SCHEMA_VERSION = 2;

export type AppDatabase = Dexie & {
  disciplines: EntityTable<Discipline, 'id'>;
  topics: EntityTable<Topic, 'id'>;
  sessions: EntityTable<StudySession, 'id'>;
  timer: EntityTable<TimerState, 'id'>;
  questionLogs: EntityTable<QuestionLog, 'id'>;
  errorNotes: EntityTable<ErrorNote, 'id'>;
  reviews: EntityTable<ReviewTask, 'id'>;
  weeklyPlans: EntityTable<WeeklyPlan, 'id'>;
  settings: EntityTable<Settings, 'id'>;
  mockExams: EntityTable<MockExam, 'id'>;
};

export function createDatabase(name: string = DB_NAME): AppDatabase {
  const database = new Dexie(name) as AppDatabase;

  database.version(1).stores({
    disciplines: 'id, order',
    topics: 'id, disciplineId, parentTopicId, order',
    sessions: 'id, date, disciplineId, topicId, status',
    timer: 'id',
    questionLogs: 'id, date, disciplineId, topicId, source',
    errorNotes: 'id, disciplineId, topicId, status, errorDate',
    reviews: 'id, dueDate, status, topicId, errorNoteId',
    weeklyPlans: 'id, &weekIndex, weekStart',
    settings: 'id',
  });

  // v2: simulados (gabarito, respostas e resultado).
  database.version(SCHEMA_VERSION).stores({
    mockExams: 'id, createdAt, submittedAt',
  });

  database.on('populate', (tx) => {
    tx.table('disciplines').bulkAdd(DEFAULT_DISCIPLINES);
    tx.table('settings').add({ ...DEFAULT_SETTINGS, distribution: { ...DEFAULT_SETTINGS.distribution } });
  });

  return database;
}

export const db = createDatabase();

/** Tabelas incluídas em backup/restauração. */
export const DATA_TABLES = [
  'disciplines',
  'topics',
  'sessions',
  'timer',
  'questionLogs',
  'errorNotes',
  'reviews',
  'weeklyPlans',
  'settings',
  'mockExams',
] as const;

export type DataTableName = (typeof DATA_TABLES)[number];

/**
 * Garante que as oito disciplinas e as configurações existam
 * (idempotente; usado na inicialização e após reinício do sistema).
 */
export async function ensureSeed(database: AppDatabase = db): Promise<void> {
  await database.transaction('rw', database.disciplines, database.settings, database.weeklyPlans, database.sessions, async () => {
    const existingList = await database.disciplines.toArray();
    const existing = new Set(existingList.map((d) => d.id));
    const missing = DEFAULT_DISCIPLINES.filter((d) => !existing.has(d.id));
    if (missing.length > 0) await database.disciplines.bulkAdd(missing);

    // Atualiza automaticamente as cores antigas para a paleta oficial do BNB
    const oldPalette = ['#2563eb', '#7c3aed', '#0d9488', '#c2410c', '#be123c', '#4d7c0f', '#a16207', '#0369a1'];
    for (const def of DEFAULT_DISCIPLINES) {
      const current = existingList.find((d) => d.id === def.id);
      if (current && oldPalette.includes(current.color) && current.color !== def.color) {
        await database.disciplines.update(current.id, { color: def.color });
      }
    }
    const settings = await database.settings.get(SETTINGS_ID);
    if (!settings) {
      await database.settings.add({ ...DEFAULT_SETTINGS, distribution: { ...DEFAULT_SETTINGS.distribution } });
    } else {
      // Completa campos ausentes (ex.: backup antigo) sem sobrescrever valores do usuário.
      const merged: Settings = { ...DEFAULT_SETTINGS, ...settings, distribution: { ...DEFAULT_SETTINGS.distribution, ...settings.distribution } };
      if (JSON.stringify(merged) !== JSON.stringify(settings)) await database.settings.put(merged);
    }

    // Normaliza planos semanais legados para começarem sempre no domingo
    const plans = await database.weeklyPlans.toArray();
    if (plans.length > 0 && plans.some((p) => weekdayIndex(p.weekStart) !== 0)) {
      plans.sort((a, b) => a.weekIndex - b.weekIndex);
      const newFirstStart = startOfWeek(plans[0].weekStart);
      const allSessions = await database.sessions.toArray();
      for (const plan of plans) {
        const newStart = addDays(newFirstStart, (plan.weekIndex - 1) * 7);
        const newEnd = addDays(newStart, 6);
        const weekSessions = allSessions.filter((s) => s.date >= newStart && s.date <= newEnd);
        const weekPlanned = weekSessions.reduce((sum, s) => sum + s.plannedMinutes, 0);
        await database.weeklyPlans.update(plan.id, {
          weekStart: newStart,
          plannedMinutes: weekPlanned || plan.plannedMinutes,
        });
      }
    }
  });
}

/** Apaga todos os dados e recria o estado inicial. */
export async function resetDatabase(database: AppDatabase = db): Promise<void> {
  await database.transaction('rw', DATA_TABLES.map((t) => database.table(t)), async () => {
    for (const t of DATA_TABLES) await database.table(t).clear();
  });
  await ensureSeed(database);
}
