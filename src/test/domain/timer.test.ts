import { describe, it, expect } from 'vitest';
import {
  elapsedSeconds,
  pausedState,
  resumedState,
  hasReachedGoal,
} from '../../domain/timer';
import type { TimerState } from '../../db/types';

describe('domain/timer - precision timestamp calculations', () => {
  it('calculates elapsed time based on timestamps and accumulated seconds', () => {
    const t0 = 1000000;
    const runningState: TimerState = {
      id: 'active',
      sessionId: null,
      status: 'running',
      startedAt: t0,
      firstStartedAt: t0,
      accumulatedSeconds: 120, // 2 minutes from earlier runs
      plannedSeconds: 3600,
      disciplineId: 'logica-programacao',
      topicId: null,
      objective: '',
      notes: '',
      updatedAt: t0,
    };

    // 30 seconds later
    const now = t0 + 30 * 1000;
    expect(elapsedSeconds(runningState, now)).toBe(150); // 120 + 30
  });

  it('does not count time during pause', () => {
    const t0 = 1000000;
    const pausedTimer: TimerState = {
      id: 'active',
      sessionId: null,
      status: 'paused',
      startedAt: null, // paused has no current running slice
      firstStartedAt: t0,
      accumulatedSeconds: 300,
      plannedSeconds: 1800,
      disciplineId: 'linguagens',
      topicId: null,
      objective: '',
      notes: '',
      updatedAt: t0 + 300 * 1000,
    };

    // 1 hour later in paused state
    const later = t0 + 3900 * 1000;
    expect(elapsedSeconds(pausedTimer, later)).toBe(300);
  });

  it('pauses and resumes without loss of precision', () => {
    const t0 = 1000000;
    let state: TimerState = {
      id: 'active',
      sessionId: null,
      status: 'running',
      startedAt: t0,
      firstStartedAt: t0,
      accumulatedSeconds: 0,
      plannedSeconds: 1800,
      disciplineId: 'linguagens',
      topicId: null,
      objective: '',
      notes: '',
      updatedAt: t0,
    };

    // Run for 45s, then pause
    const pauseTime = t0 + 45 * 1000;
    state = pausedState(state, pauseTime);
    expect(state.status).toBe('paused');
    expect(state.accumulatedSeconds).toBe(45);
    expect(state.startedAt).toBeNull();

    // 5 minutes later, resume
    const resumeTime = pauseTime + 300 * 1000;
    state = resumedState(state, resumeTime);
    expect(state.status).toBe('running');
    expect(state.startedAt).toBe(resumeTime);
    expect(state.accumulatedSeconds).toBe(45);

    // 15 seconds after resuming
    const finalTime = resumeTime + 15 * 1000;
    expect(elapsedSeconds(state, finalTime)).toBe(60); // 45 + 15 = 60s
  });

  it('detects when planned goal has been reached and allows overflow', () => {
    expect(hasReachedGoal(3599, 3600)).toBe(false);
    expect(hasReachedGoal(3600, 3600)).toBe(true);
    expect(hasReachedGoal(4000, 3600)).toBe(true); // study past planned duration
  });
});
