import { describe, it, expect } from 'vitest';
import {
  splitIntoBlocks,
  distributeWeek,
  buildWeeklyPlans,
  detectOverload,
  isManualSession,
} from '../../domain/schedule';
import { DEFAULT_DISCIPLINES } from '../../db/seed';
import { addDays } from '../../lib/dates';
import type { StudySession } from '../../db/types';

describe('domain/schedule - blocks and 24-week distribution', () => {
  it('splits minutes into blocks of at most 60 minutes in multiples of 5', () => {
    // 120 minutes -> 2 blocks of 60
    expect(splitIntoBlocks(120)).toEqual([60, 60]);

    // 100 minutes -> 2 blocks of 50
    expect(splitIntoBlocks(100)).toEqual([50, 50]);

    // 45 minutes -> 1 block of 45
    expect(splitIntoBlocks(45)).toEqual([45]);

    // 0 minutes -> empty
    expect(splitIntoBlocks(0)).toEqual([]);
  });

  it('distributes 840 minutes across Mon-Sat and places exclusively a 4h mock exam on Sunday', () => {
    const distribution: Record<string, number> = {
      portugues: 120,
      raciocinio: 120,
      'logica-programacao': 100,
      arquitetura: 100,
      engenharia: 100,
      linguagens: 100,
      'banco-dados': 100,
      nuvem: 100,
    };

    // 2026-10-12 is Monday, 2026-10-18 is Sunday
    const blocks = distributeWeek('2026-10-12', distribution, DEFAULT_DISCIPLINES);
    const totalMinutes = blocks.reduce((acc, b) => acc + b.minutes, 0);
    // 840 min regular disciplines + 240 min Sunday mock exam = 1080 min
    expect(totalMinutes).toBe(1080);

    // Checks that all 7 days have scheduled sessions
    const daysWithStudy = new Set(blocks.map((b) => b.date));
    expect(daysWithStudy.size).toBe(7);

    // Sunday (2026-10-18) must have ONLY the 4h mock exam
    const sundayBlocks = blocks.filter((b) => b.date === '2026-10-18');
    expect(sundayBlocks).toHaveLength(1);
    expect(sundayBlocks[0].disciplineId).toBe('simulado');
    expect(sundayBlocks[0].minutes).toBe(240);

    // Monday to Saturday must only have regular disciplines (840m total)
    const monToSatBlocks = blocks.filter((b) => b.date !== '2026-10-18');
    expect(monToSatBlocks.reduce((acc, b) => acc + b.minutes, 0)).toBe(840);
    expect(monToSatBlocks.every((b) => b.disciplineId !== 'simulado')).toBe(true);
  });

  it('generates 24 weekly plans with proper week indices and consecutive week starts starting on Sunday', () => {
    const plans = buildWeeklyPlans('2026-10-12', 24, 840);
    expect(plans.length).toBe(24);
    expect(plans[0].weekIndex).toBe(1);
    expect(plans[0].weekStart).toBe('2026-10-11');
    expect(plans[23].weekIndex).toBe(24);
    expect(plans[23].weekStart).toBe(addDays('2026-10-11', 23 * 7));
  });

  it('detects overload when day or week exceeds goal', () => {
    const sessions: StudySession[] = [
      {
        id: 's1',
        date: '2026-10-12',
        disciplineId: 'arquitetura',
        topicId: null,
        plannedStart: null,
        plannedMinutes: 150, // exceeds daily goal of 120
        actualSeconds: 0,
        status: 'planejada',
        objective: '',
        notes: '',
        origin: 'planejada',
        startedAt: null,
        endedAt: null,
        recoveredFromId: null,
        history: [],
        createdAt: '',
        updatedAt: '',
      },
    ];

    const overload = detectOverload(sessions, '2026-10-12', 120, 840);
    expect(overload.overloadedDays.length).toBe(1);
    expect(overload.overloadedDays[0].date).toBe('2026-10-12');
    expect(overload.overloadedDays[0].minutes).toBe(150);
    expect(overload.weekOverloaded).toBe(false);
  });

  it('correctly identifies manual sessions vs auto-generated sessions', () => {
    const autoSession: StudySession = {
      id: 'auto-1',
      date: '2026-10-12',
      disciplineId: 'arquitetura',
      topicId: null,
      plannedStart: null,
      plannedMinutes: 60,
      actualSeconds: 0,
      status: 'planejada',
      objective: '',
      notes: '',
      origin: 'planejada',
      startedAt: null,
      endedAt: null,
      recoveredFromId: null,
      history: [{ at: '2026-10-12T08:00:00Z', type: 'criada', description: 'Criada pelo cronograma semanal.' }],
      createdAt: '',
      updatedAt: '',
    };
    expect(isManualSession(autoSession)).toBe(false);

    // Manual session with isManual: true
    const manual1: StudySession = { ...autoSession, isManual: true };
    expect(isManualSession(manual1)).toBe(true);

    // Session created by user (history description does not contain "pelo cronograma")
    const manual2: StudySession = {
      ...autoSession,
      history: [{ at: '2026-10-12T08:00:00Z', type: 'criada', description: 'Sessão planejada criada pelo usuário.' }],
    };
    expect(isManualSession(manual2)).toBe(true);

    // Session edited by user
    const edited: StudySession = {
      ...autoSession,
      history: [
        { at: '2026-10-12T08:00:00Z', type: 'criada', description: 'Criada pelo cronograma semanal.' },
        { at: '2026-10-12T09:00:00Z', type: 'editada', description: 'Alterada pelo usuário.' },
      ],
    };
    expect(isManualSession(edited)).toBe(true);
  });

  it('distributeWeek respects pre-existing sessions, deduces minutes, and avoids same-day collisions', () => {
    const distribution: Record<string, number> = {
      portugues: 120,
      arquitetura: 100, // 100 minutes total target for arquitetura
    };

    // Pre-created session: 60m of arquitetura on Monday (2026-10-12)
    const existingArqSession: StudySession = {
      id: 'manual-arq',
      date: '2026-10-12',
      disciplineId: 'arquitetura',
      topicId: null,
      plannedStart: '10:00',
      plannedMinutes: 60,
      actualSeconds: 0,
      status: 'planejada',
      objective: 'Arquitetura Manual',
      notes: '',
      origin: 'planejada',
      isManual: true,
      startedAt: null,
      endedAt: null,
      recoveredFromId: null,
      history: [{ at: '2026-10-12T08:00:00Z', type: 'criada', description: 'Sessão planejada criada pelo usuário.' }],
      createdAt: '',
      updatedAt: '',
    };

    const disciplines = DEFAULT_DISCIPLINES.filter((d) => d.id === 'portugues' || d.id === 'arquitetura');

    const blocks = distributeWeek(
      '2026-10-12',
      distribution,
      disciplines,
      false, // no sunday mock exam for this test
      [existingArqSession],
    );

    // Total target was: portugues 120 + arquitetura 100 = 220m
    // Since 60m of arquitetura already exists, remaining generated should be 220 - 60 = 160m
    const totalMinutesGenerated = blocks.reduce((acc, b) => acc + b.minutes, 0);
    expect(totalMinutesGenerated).toBe(160);

    // Arquitetura generated minutes should be 100 - 60 = 40m
    const arqBlocks = blocks.filter((b) => b.disciplineId === 'arquitetura');
    const arqMinutes = arqBlocks.reduce((acc, b) => acc + b.minutes, 0);
    expect(arqMinutes).toBe(40);

    // Arquitetura should NOT be scheduled on Monday (2026-10-12) where it already exists!
    expect(arqBlocks.some((b) => b.date === '2026-10-12')).toBe(false);
  });

  it('distributeWeek does not duplicate Sunday mock exam if one already exists', () => {
    const distribution: Record<string, number> = {
      portugues: 60,
    };
    const sundayMockSession: StudySession = {
      id: 'existing-mock',
      date: '2026-10-18', // Sunday
      disciplineId: 'simulado',
      topicId: null,
      plannedStart: '08:00',
      plannedMinutes: 240,
      actualSeconds: 0,
      status: 'planejada',
      objective: 'Simulado',
      notes: '',
      origin: 'planejada',
      isManual: true,
      startedAt: null,
      endedAt: null,
      recoveredFromId: null,
      history: [],
      createdAt: '',
      updatedAt: '',
    };

    const disciplines = DEFAULT_DISCIPLINES.filter((d) => d.id === 'portugues');
    const blocks = distributeWeek(
      '2026-10-12',
      distribution,
      disciplines,
      true,
      [sundayMockSession],
    );

    // Should NOT have added another simulado on Sunday
    const sundayBlocks = blocks.filter((b) => b.date === '2026-10-18' && b.disciplineId === 'simulado');
    expect(sundayBlocks).toHaveLength(0);
  });
});
