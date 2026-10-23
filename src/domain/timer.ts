/**
 * Lógica pura do cronômetro.
 * O tempo é calculado a partir de timestamps persistidos (início do trecho em
 * execução) somados ao tempo acumulado de trechos anteriores, de modo que abas
 * inativas, suspensões do navegador ou recarregamentos não afetem a contagem.
 */
import type { TimerState } from '../db/types';

export function elapsedSeconds(state: Pick<TimerState, 'status' | 'startedAt' | 'accumulatedSeconds'>, now: number): number {
  const running = state.status === 'running' && state.startedAt !== null ? Math.max(0, (now - state.startedAt) / 1000) : 0;
  return Math.floor(state.accumulatedSeconds + running);
}

export function pausedState(state: TimerState, now: number): TimerState {
  if (state.status !== 'running') return state;
  return {
    ...state,
    status: 'paused',
    accumulatedSeconds: elapsedSeconds(state, now),
    startedAt: null,
    updatedAt: now,
  };
}

export function resumedState(state: TimerState, now: number): TimerState {
  if (state.status !== 'paused') return state;
  return { ...state, status: 'running', startedAt: now, updatedAt: now };
}

/** Progresso (0..n) em relação à duração planejada; pode ultrapassar 1. */
export function timerProgress(elapsed: number, plannedSeconds: number): number {
  if (plannedSeconds <= 0) return 0;
  return elapsed / plannedSeconds;
}

export function hasReachedGoal(elapsed: number, plannedSeconds: number): boolean {
  return plannedSeconds > 0 && elapsed >= plannedSeconds;
}
