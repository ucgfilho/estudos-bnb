import { describe, it, expect } from 'vitest';
import {
  dailyProgress,
  detectAchievements,
  evaluateQuestionLog,
  pickMessage,
  primaryAchievement,
  progressFraming,
  snapshot,
} from '../../domain/motivation';
import type { QuestionLog, StudySession } from '../../db/types';

const TODAY = '2026-10-21';
const settings = { dailyGoalMinutes: 60, dailyQuestionGoal: 20 };

function session(id: string, over: Partial<StudySession> = {}): StudySession {
  return {
    id,
    date: TODAY,
    disciplineId: 'banco-dados',
    topicId: null,
    plannedStart: null,
    plannedMinutes: 30,
    actualSeconds: 0,
    status: 'planejada',
    objective: '',
    notes: '',
    origin: 'planejada',
    startedAt: null,
    endedAt: null,
    recoveredFromId: null,
    history: [],
    createdAt: '2026-10-21T10:00:00Z',
    updatedAt: '2026-10-21T10:00:00Z',
    ...over,
  };
}

function done(s: StudySession, minutes: number): StudySession {
  return { ...s, status: 'concluida', actualSeconds: minutes * 60, startedAt: '2026-10-21T13:00:00Z' };
}

function log(id: string, correct: number, incorrect: number, over: Partial<QuestionLog> = {}): QuestionLog {
  return {
    id,
    date: TODAY,
    disciplineId: 'banco-dados',
    topicId: null,
    source: '',
    total: correct + incorrect,
    correct,
    incorrect,
    blank: 0,
    durationMinutes: null,
    notes: '',
    sessionId: null,
    createdAt: '2026-10-21T10:00:00Z',
    updatedAt: '2026-10-21T10:00:00Z',
    ...over,
  };
}

describe('domain/motivation - daily progress', () => {
  it('summarises time, scheduled blocks and questions for today', () => {
    const sessions = [done(session('a'), 30), session('b'), session('c', { origin: 'avulsa', status: 'concluida', actualSeconds: 600, startedAt: '2026-10-21T15:00:00Z' })];
    const p = dailyProgress(sessions, [log('l1', 8, 2)], settings, TODAY);
    expect(p.studiedMinutes).toBe(40);
    expect(p.ratio).toBeCloseTo(40 / 60);
    expect(p.scheduled.map((s) => s.id)).toEqual(['a', 'b']); // avulsa não entra no cronograma
    expect(p.scheduledDone).toBe(1);
    expect(p.questionsToday).toBe(10);
  });

  it('frames progress by accumulated work early and by remaining work late (Koo & Fishbach)', () => {
    expect(progressFraming(0, 120)).toMatch(/primeiro bloco/i);
    expect(progressFraming(30, 120)).toMatch(/já acumulou 30 min/);
    expect(progressFraming(80, 120)).toMatch(/Faltam 40 min/);
    expect(progressFraming(110, 120)).toMatch(/Faltam só 10 min/);
    expect(progressFraming(130, 120)).toMatch(/cumprida/);
  });
});

describe('domain/motivation - achievement detection', () => {
  it('detects session completion, daily goal and full schedule in the same transition', () => {
    const before = [done(session('a'), 40), session('b')];
    const after = [done(session('a'), 40), done(session('b'), 25)];
    const prev = snapshot(before, [], settings, TODAY);
    const next = snapshot(after, [], settings, TODAY);
    const found = detectAchievements(prev, next, after, [], 80);
    expect(found.map((a) => a.kind).sort()).toEqual(['daily-goal', 'schedule-complete', 'session-complete']);
    expect(primaryAchievement(found)?.kind).toBe('schedule-complete');
  });

  it('does not celebrate on unrelated edits', () => {
    const s = [done(session('a'), 70)];
    const prev = snapshot(s, [], settings, TODAY);
    const next = snapshot([{ ...s[0], notes: 'editado' }], [], settings, TODAY);
    expect(detectAchievements(prev, next, s, [], 80)).toEqual([]);
  });

  it('ignores bulk changes such as backup restores', () => {
    const prev = snapshot([], [], settings, TODAY);
    const logs = [log('1', 9, 1), log('2', 9, 1), log('3', 9, 1), log('4', 9, 1)];
    const next = snapshot([], logs, settings, TODAY);
    expect(detectAchievements(prev, next, [], logs, 80)).toEqual([]);
  });

  it('detects daily question goal crossing', () => {
    const old = [log('1', 10, 5)];
    const all = [...old, log('2', 3, 2)];
    const found = detectAchievements(snapshot([], old, settings, TODAY), snapshot([], all, settings, TODAY), [], all, 80);
    expect(found.some((a) => a.kind === 'question-goal')).toBe(true);
  });
});

describe('domain/motivation - question evaluation', () => {
  it('celebrates a perfect battery as a big achievement', () => {
    const [a] = evaluateQuestionLog(log('n', 10, 0), [], 80);
    expect(a).toMatchObject({ kind: 'questions-perfect', tier: 'big' });
  });

  it('detects a personal best within the discipline', () => {
    const history = [log('h1', 6, 4), log('h2', 7, 3)];
    const kinds = evaluateQuestionLog(log('n', 9, 1), history, 80).map((a) => a.kind);
    expect(kinds).toContain('personal-best');
    expect(kinds).toContain('questions-great');
  });

  it('gives informational (not celebratory) feedback below the goal', () => {
    const [a] = evaluateQuestionLog(log('n', 4, 6), [], 80);
    expect(a).toMatchObject({ kind: 'questions-logged', tier: 'info' });
  });

  it('ignores logs without graded questions', () => {
    expect(evaluateQuestionLog(log('n', 0, 0, { blank: 5, total: 5 }), [], 80)).toEqual([]);
  });
});

describe('domain/motivation - variable messages', () => {
  it('returns different messages depending on randomness', () => {
    const first = pickMessage('session-complete', () => 0);
    const last = pickMessage('session-complete', () => 0.99);
    expect(first.title).not.toBe(last.title);
  });
});
