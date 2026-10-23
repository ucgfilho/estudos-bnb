import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { ACTIVE_TIMER_ID, SETTINGS_ID } from '../db/types';
import { todayKey } from '../lib/dates';

/*
 * Hooks de leitura reativa (Dexie liveQuery). Retornam `undefined` enquanto
 * carregam, permitindo estados de carregamento explícitos nas telas.
 */

const EMPTY_ARRAY: never[] = [];

export function useDisciplines() {
  return useLiveQuery(() => db.disciplines.orderBy('order').toArray(), [], EMPTY_ARRAY);
}

export function useTopics() {
  return useLiveQuery(() => db.topics.toArray(), [], EMPTY_ARRAY);
}

export function useSessions() {
  return useLiveQuery(() => db.sessions.toArray(), [], EMPTY_ARRAY);
}

export function useQuestionLogs() {
  return useLiveQuery(() => db.questionLogs.toArray(), [], EMPTY_ARRAY);
}

export function useErrorNotes() {
  return useLiveQuery(() => db.errorNotes.toArray(), [], EMPTY_ARRAY);
}

export function useReviews() {
  return useLiveQuery(() => db.reviews.toArray(), [], EMPTY_ARRAY);
}

export function useWeeklyPlans() {
  return useLiveQuery(() => db.weeklyPlans.orderBy('weekIndex').toArray(), [], EMPTY_ARRAY);
}

export function useMockExams() {
  return useLiveQuery(() => db.mockExams.toArray(), [], EMPTY_ARRAY);
}

export function useSettings() {
  return useLiveQuery(() => db.settings.get(SETTINGS_ID), []);
}

/** `null` quando não há cronômetro ativo; `undefined` enquanto carrega. */
export function useActiveTimer() {
  return useLiveQuery(async () => (await db.timer.get(ACTIVE_TIMER_ID)) ?? null, []);
}

/** Instante atual, atualizado periodicamente (apenas para re-renderização). */
export function useNow(intervalMs = 1000, enabled = true): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    const onVisible = () => setNow(Date.now());
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [intervalMs, enabled]);
  return now;
}

/** Data de hoje (America/Bahia), atualizada na virada do dia. */
export function useToday(): string {
  const now = useNow(30_000);
  return todayKey(now);
}
