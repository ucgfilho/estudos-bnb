import { describe, it, expect } from 'vitest';
import {
  accuracy,
  sumQuestions,
  studyStreak,
  topicProgress,
  worstTopics,
  accuracyByDiscipline,
  weekScheduleMetrics,
} from '../../domain/metrics';
import type { QuestionLog, StudySession, Topic, Discipline } from '../../db/types';

describe('domain/metrics - accuracy calculations', () => {
  it('calculates accuracy formula: correct / (correct + incorrect) * 100', () => {
    expect(accuracy(8, 2)).toBe(80);
    expect(accuracy(10, 0)).toBe(100);
    expect(accuracy(0, 10)).toBe(0);
  });

  it('ignores blank questions in the denominator', () => {
    // 8 correct, 2 incorrect, 10 blank -> 8 / (8 + 2) = 80%
    const logs: QuestionLog[] = [
      {
        id: '1',
        date: '2026-10-14',
        disciplineId: 'portugues',
        topicId: null,
        source: 'Cespe',
        total: 20,
        correct: 8,
        incorrect: 2,
        blank: 10,
        durationMinutes: 30,
        notes: '',
        sessionId: null,
        createdAt: '2026-10-14T10:00:00Z',
        updatedAt: '2026-10-14T10:00:00Z',
      },
    ];
    const totals = sumQuestions(logs);
    expect(totals.total).toBe(20);
    expect(totals.correct).toBe(8);
    expect(totals.incorrect).toBe(2);
    expect(totals.blank).toBe(10);
    expect(totals.accuracy).toBe(80);
  });

  it('returns null when there are no graded questions', () => {
    expect(accuracy(0, 0)).toBeNull();
    const totals = sumQuestions([]);
    expect(totals.accuracy).toBeNull();
  });
});

describe('domain/metrics - study streak', () => {
  it('calculates streak correctly for consecutive days up to today', () => {
    const sessions: StudySession[] = [
      {
        id: 's1',
        date: '2026-10-14',
        disciplineId: 'arquitetura',
        topicId: null,
        plannedStart: null,
        plannedMinutes: 60,
        actualSeconds: 3600,
        status: 'concluida',
        objective: '',
        notes: '',
        origin: 'planejada',
        startedAt: '2026-10-14T10:00:00Z',
        endedAt: '2026-10-14T11:00:00Z',
        recoveredFromId: null,
        history: [],
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 's2',
        date: '2026-10-13',
        disciplineId: 'arquitetura',
        topicId: null,
        plannedStart: null,
        plannedMinutes: 60,
        actualSeconds: 3600,
        status: 'concluida',
        objective: '',
        notes: '',
        origin: 'planejada',
        startedAt: '2026-10-13T10:00:00Z',
        endedAt: '2026-10-13T11:00:00Z',
        recoveredFromId: null,
        history: [],
        createdAt: '',
        updatedAt: '',
      },
    ];
    expect(studyStreak(sessions, '2026-10-14')).toBe(2);
  });

  it('considers yesterday if today has not been studied yet', () => {
    const sessions: StudySession[] = [
      {
        id: 's1',
        date: '2026-10-13',
        disciplineId: 'arquitetura',
        topicId: null,
        plannedStart: null,
        plannedMinutes: 60,
        actualSeconds: 3600,
        status: 'concluida',
        objective: '',
        notes: '',
        origin: 'planejada',
        startedAt: '2026-10-13T10:00:00Z',
        endedAt: '2026-10-13T11:00:00Z',
        recoveredFromId: null,
        history: [],
        createdAt: '',
        updatedAt: '',
      },
    ];
    expect(studyStreak(sessions, '2026-10-14')).toBe(1);
  });

  it('returns 0 if neither today nor yesterday has study records', () => {
    const sessions: StudySession[] = [
      {
        id: 's1',
        date: '2026-10-10',
        disciplineId: 'arquitetura',
        topicId: null,
        plannedStart: null,
        plannedMinutes: 60,
        actualSeconds: 3600,
        status: 'concluida',
        objective: '',
        notes: '',
        origin: 'planejada',
        startedAt: '2026-10-10T10:00:00Z',
        endedAt: '2026-10-10T11:00:00Z',
        recoveredFromId: null,
        history: [],
        createdAt: '',
        updatedAt: '',
      },
    ];
    expect(studyStreak(sessions, '2026-10-14')).toBe(0);
  });
});

describe('domain/metrics - topics and worst performers', () => {
  it('calculates topic progress for active topics', () => {
    const topics: Topic[] = [
      {
        id: 't1',
        disciplineId: 'arquitetura',
        title: 'Microservices',
        parentTopicId: null,
        status: 'concluido',
        notes: '',
        order: 0,
        active: true,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 't2',
        disciplineId: 'arquitetura',
        title: 'Monolith',
        parentTopicId: null,
        status: 'dominado',
        notes: '',
        order: 1,
        active: true,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 't3',
        disciplineId: 'arquitetura',
        title: 'Event Driven',
        parentTopicId: null,
        status: 'em-andamento',
        notes: '',
        order: 2,
        active: true,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 't4',
        disciplineId: 'arquitetura',
        title: 'Deprecated',
        parentTopicId: null,
        status: 'nao-iniciado',
        notes: '',
        order: 3,
        active: false, // inactive topic
        createdAt: '',
        updatedAt: '',
      },
    ];

    const progress = topicProgress(topics);
    expect(progress.total).toBe(3); // only active
    expect(progress.completed).toBe(2); // concluido + dominado
    expect(progress.mastered).toBe(1);
    expect(progress.inProgress).toBe(1);
    expect(progress.percent).toBeCloseTo(66.67, 1);
  });

  it('identifies worst performing topics', () => {
    const topics: Topic[] = [
      { id: 't1', disciplineId: 'banco-dados', title: 'SQL Joins', parentTopicId: null, status: 'em-andamento', notes: '', order: 0, active: true, createdAt: '', updatedAt: '' },
      { id: 't2', disciplineId: 'banco-dados', title: 'Índices B-Tree', parentTopicId: null, status: 'em-andamento', notes: '', order: 1, active: true, createdAt: '', updatedAt: '' },
    ];
    const logs: QuestionLog[] = [
      { id: '1', date: '2026-10-14', disciplineId: 'banco-dados', topicId: 't1', source: '', total: 10, correct: 9, incorrect: 1, blank: 0, durationMinutes: null, notes: '', sessionId: null, createdAt: '', updatedAt: '' },
      { id: '2', date: '2026-10-14', disciplineId: 'banco-dados', topicId: 't2', source: '', total: 10, correct: 4, incorrect: 6, blank: 0, durationMinutes: null, notes: '', sessionId: null, createdAt: '', updatedAt: '' },
    ];

    const worst = worstTopics(logs, topics);
    expect(worst[0].topicId).toBe('t2');
    expect(worst[0].accuracy).toBe(40);
  });

  it('calculates accuracy grouped by discipline', () => {
    const disciplines: Discipline[] = [
      { id: 'portugues', name: 'Língua Portuguesa', kind: 'general', color: '#3b82f6', active: true, order: 0 },
      { id: 'banco-dados', name: 'Banco de Dados', kind: 'technical', color: '#10b981', active: true, order: 1 },
    ];
    const logs: QuestionLog[] = [
      { id: '1', date: '2026-10-14', disciplineId: 'portugues', topicId: null, source: '', total: 10, correct: 8, incorrect: 2, blank: 0, durationMinutes: null, notes: '', sessionId: null, createdAt: '', updatedAt: '' },
      { id: '2', date: '2026-10-14', disciplineId: 'banco-dados', topicId: null, source: '', total: 5, correct: 5, incorrect: 0, blank: 0, durationMinutes: null, notes: '', sessionId: null, createdAt: '', updatedAt: '' },
    ];
    const list = accuracyByDiscipline(logs, disciplines);
    const pt = list.find((d) => d.disciplineId === 'portugues');
    const bd = list.find((d) => d.disciplineId === 'banco-dados');
    expect(pt?.accuracy).toBe(80);
    expect(bd?.accuracy).toBe(100);
  });
});

describe('domain/metrics - weekScheduleMetrics synchronization', () => {
  it('synchronizes plannedMinutes, doneMinutes, and completionRate across manual and planned sessions in the week', () => {
    const sessions: StudySession[] = [
      {
        id: 's1',
        date: '2026-10-18',
        disciplineId: 'portugues',
        topicId: null,
        plannedStart: null,
        plannedMinutes: 300,
        actualSeconds: 15000,
        status: 'concluida',
        objective: 'Estudo domingo',
        notes: '',
        origin: 'planejada',
        startedAt: '2026-10-18T10:00:00Z',
        endedAt: '2026-10-18T14:10:00Z',
        recoveredFromId: null,
        history: [],
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 's2',
        date: '2026-10-21',
        disciplineId: 'raciocinio',
        topicId: null,
        plannedStart: null,
        plannedMinutes: 15,
        actualSeconds: 900,
        status: 'concluida',
        objective: 'Sessão avulsa quarta',
        notes: '',
        origin: 'avulsa',
        startedAt: '2026-10-21T19:00:00Z',
        endedAt: '2026-10-21T19:15:00Z',
        recoveredFromId: null,
        history: [],
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 's3',
        date: '2026-10-24',
        disciplineId: 'simulado',
        topicId: null,
        plannedStart: null,
        plannedMinutes: 120,
        actualSeconds: 7200,
        status: 'concluida',
        objective: 'Simulado sábado concluído no domingo',
        notes: '',
        origin: 'planejada',
        startedAt: '2026-10-25T09:00:00Z',
        endedAt: '2026-10-25T11:00:00Z',
        recoveredFromId: null,
        history: [],
        createdAt: '',
        updatedAt: '',
      },
    ];

    const metrics = weekScheduleMetrics(sessions, '2026-10-18', '2026-10-24');
    expect(metrics.totalSessions).toBe(3);
    expect(metrics.completedSessions).toBe(3);
    expect(metrics.plannedMinutes).toBe(435);
    expect(metrics.doneMinutes).toBe(435);
    expect(metrics.completionRate).toBe(100);
  });
});
