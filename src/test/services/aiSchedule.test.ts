import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildBuiltinAiSchedule,
  callGeminiScheduleApi,
  generateAiSchedulePlan,
  filterAndAdjustAiSessions,
  BNB_TI_DISCIPLINES,
  BNB_BASIC_DISCIPLINES,
} from '../../services/aiSchedule';
import { DEFAULT_DISCIPLINES, DEFAULT_SETTINGS } from '../../db/seed';
import type { StudySession } from '../../db/types';
import { addDays, weekdayIndex } from '../../lib/dates';
import { SIMULADO_DISCIPLINE_ID } from '../../domain/schedule';

describe('services/aiSchedule - BNB TI 24-week AI Generation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('generates exactly 24 weekly plans with progressive pedagogical phases starting on Sunday', () => {
    const startDate = '2026-10-12'; // Monday
    const { weeklyPlans, sessions } = buildBuiltinAiSchedule(startDate, DEFAULT_DISCIPLINES, []);

    expect(weeklyPlans).toHaveLength(24);
    expect(weeklyPlans[0].weekIndex).toBe(1);
    expect(weeklyPlans[0].weekStart).toBe('2026-10-11');
    expect(weeklyPlans[0].objectives).toContain('Lógica');

    expect(weeklyPlans[23].weekIndex).toBe(24);
    expect(weeklyPlans[23].weekStart).toBe(addDays('2026-10-11', 23 * 7));
    expect(weeklyPlans[23].objectives).toContain('Consolidação Definitiva');

    expect(sessions.length).toBeGreaterThan(0);
  });

  it('strictly limits every single study day to exactly 2 hours (120 minutes)', () => {
    const startDate = '2026-10-12';
    const { sessions } = buildBuiltinAiSchedule(startDate, DEFAULT_DISCIPLINES, []);

    // Group sessions by date
    const dayTotals = new Map<string, number>();
    for (const s of sessions) {
      dayTotals.set(s.date, (dayTotals.get(s.date) ?? 0) + s.plannedMinutes);
    }

    // Every study day must have exactly 120 minutes (2 hours)
    for (const [date, minutes] of dayTotals.entries()) {
      expect(minutes, `Day ${date} must have exactly 120 minutes (2h)`).toBe(120);
    }
  });

  it('ensures Saturdays are exclusively dedicated to questions or simulados (120 min)', () => {
    const startDate = '2026-10-12'; // Monday
    const { sessions } = buildBuiltinAiSchedule(startDate, DEFAULT_DISCIPLINES, []);

    // Find all sessions on Saturdays (weekdayIndex === 6)
    const saturdaySessions = sessions.filter((s) => weekdayIndex(s.date) === 6);

    // There must be 24 Saturdays in 24 weeks
    const uniqueSaturdays = new Set(saturdaySessions.map((s) => s.date));
    expect(uniqueSaturdays.size).toBe(24);

    // Each Saturday session must be simulado/questões with 120m
    for (const s of saturdaySessions) {
      expect(s.disciplineId).toBe(SIMULADO_DISCIPLINE_ID);
      expect(s.plannedMinutes).toBe(120);
      expect(s.objective.toLowerCase()).toMatch(/questões|simulado/);
    }
  });

  it('ensures Sundays are free rest days with 0 planned minutes', () => {
    const startDate = '2026-10-12'; // Monday
    const { sessions } = buildBuiltinAiSchedule(startDate, DEFAULT_DISCIPLINES, []);

    // Sundays have weekdayIndex === 0
    const sundaySessions = sessions.filter((s) => weekdayIndex(s.date) === 0);
    expect(sundaySessions).toHaveLength(0);
  });

  it('allocates significantly more weekday study time to Conhecimentos Específicos TI than Conhecimentos Básicos', () => {
    const startDate = '2026-10-12';
    const { sessions } = buildBuiltinAiSchedule(startDate, DEFAULT_DISCIPLINES, []);

    // Weekdays only (Monday to Friday, weekdayIndex 1 to 5)
    const weekdaySessions = sessions.filter((s) => weekdayIndex(s.date) >= 1 && weekdayIndex(s.date) <= 5);

    let tiMinutes = 0;
    let basicMinutes = 0;

    for (const s of weekdaySessions) {
      if ((BNB_TI_DISCIPLINES as readonly string[]).includes(s.disciplineId)) {
        tiMinutes += s.plannedMinutes;
      } else if ((BNB_BASIC_DISCIPLINES as readonly string[]).includes(s.disciplineId)) {
        basicMinutes += s.plannedMinutes;
      }
    }

    // TI minutes must be heavily prioritized (~80% of weekday study)
    expect(tiMinutes).toBeGreaterThan(basicMinutes * 3);
    const tiPercentage = (tiMinutes / (tiMinutes + basicMinutes)) * 100;
    expect(tiPercentage).toBeGreaterThanOrEqual(75);
  });

  it('preserves pre-existing manual sessions and avoids exceeding the 2h daily limit', () => {
    const startDate = '2026-10-12'; // Monday
    const { sessions: aiGenerated } = buildBuiltinAiSchedule(startDate, DEFAULT_DISCIPLINES, []);

    // User pre-created a 60 min session of 'arquitetura' on Monday 2026-10-12
    const manualSession: StudySession = {
      id: 'manual-session-1',
      date: '2026-10-12',
      disciplineId: 'arquitetura',
      topicId: null,
      plannedStart: '14:00',
      plannedMinutes: 60,
      actualSeconds: 0,
      status: 'planejada',
      objective: 'Estudo manual prévio',
      notes: '',
      origin: 'planejada',
      isManual: true,
      startedAt: null,
      endedAt: null,
      recoveredFromId: null,
      history: [{ at: '2026-10-12T00:00:00Z', type: 'criada', description: 'Manual' }],
      createdAt: '',
      updatedAt: '',
    };

    const adjusted = filterAndAdjustAiSessions(aiGenerated, [manualSession]);

    // Monday sessions in adjusted
    const mondayAdjusted = adjusted.filter((s) => s.date === '2026-10-12');

    // Should NOT duplicate 'arquitetura'
    expect(mondayAdjusted.some((s) => s.disciplineId === 'arquitetura')).toBe(false);

    // Total minutes of AI sessions + manual session must not exceed 120m
    const totalMonday = mondayAdjusted.reduce((sum, s) => sum + s.plannedMinutes, 0) + manualSession.plannedMinutes;
    expect(totalMonday).toBeLessThanOrEqual(120);
  });

  it('calls Gemini API when configured and parses structured 24-week response', async () => {
    const fakeGeminiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  weeks: Array.from({ length: 24 }, (_, i) => ({
                    weekIndex: i + 1,
                    objectives: `Semana ${i + 1} gerada por Gemini`,
                    plannedContent: 'Conteúdo de TI BNB',
                    days: [
                      {
                        dayOffset: 0,
                        sessions: [
                          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Arquitetura Clean' },
                          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Scrum' },
                        ],
                      },
                      {
                        dayOffset: 5,
                        sessions: [
                          { disciplineId: 'simulado', plannedMinutes: 120, objective: 'Simulado Cebraspe' },
                        ],
                      },
                    ],
                  })),
                }),
              },
            ],
          },
        },
      ],
    };

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('interactions')) {
        return {
          ok: true,
          json: async () => ({
            output_text: JSON.stringify({
              weeks: Array.from({ length: 24 }, (_, i) => ({
                weekIndex: i + 1,
                objectives: `Semana ${i + 1} gerada por Gemini`,
                plannedContent: 'Conteúdo de TI BNB',
                days: [
                  {
                    dayOffset: 0,
                    sessions: [
                      { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Arquitetura Clean' },
                      { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Scrum' },
                    ],
                  },
                  {
                    dayOffset: 5,
                    sessions: [
                      { disciplineId: 'simulado', plannedMinutes: 120, objective: 'Simulado Cebraspe' },
                    ],
                  },
                ],
              })),
            }),
          }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => fakeGeminiResponse,
      } as Response;
    });

    const result = await callGeminiScheduleApi(
      'AIzaSyFakeKey123',
      '2026-10-12',
      DEFAULT_DISCIPLINES,
      [],
      'Foco em Java',
    );

    expect(result.weeklyPlans).toHaveLength(24);
    expect(result.weeklyPlans[0].objectives).toBe('Semana 1 gerada por Gemini');
    expect(result.sessions.length).toBeGreaterThan(0);
  });

  it('generateAiSchedulePlan falls back to builtin if provider is builtin or no API key', async () => {
    const result = await generateAiSchedulePlan({
      startDate: '2026-10-12',
      disciplines: DEFAULT_DISCIPLINES,
      topics: [],
      settings: DEFAULT_SETTINGS,
      options: { provider: 'builtin' },
    });

    expect(result.providerUsed).toBe('builtin');
    expect(result.weeklyPlans).toHaveLength(24);
    expect(result.sessions.length).toBeGreaterThan(0);
  });

  it('aligns Sunday as free rest day and Saturday as simulado/questões even when startDate is a Wednesday (e.g. 2026-10-21)', () => {
    const startDate = '2026-10-21'; // Quarta-feira (21/10)
    const { weeklyPlans, sessions } = buildBuiltinAiSchedule(startDate, DEFAULT_DISCIPLINES, []);

    expect(weeklyPlans).toHaveLength(24);
    expect(weeklyPlans[0].weekStart).toBe('2026-10-18');

    // Domingo real do calendário (25/10 e todos os domingos subsequentes) deve ser livre (0 sessões)
    const sundaySessions = sessions.filter((s) => weekdayIndex(s.date) === 0);
    expect(sundaySessions).toHaveLength(0);
    expect(sessions.filter((s) => s.date === '2026-10-25')).toHaveLength(0);

    // Sábado real do calendário (24/10 e todos os sábados subsequentes) deve ser exclusivo de questões/simulado
    const saturdaySessions = sessions.filter((s) => weekdayIndex(s.date) === 6);
    expect(saturdaySessions.length).toBe(24);
    for (const s of saturdaySessions) {
      expect(s.disciplineId).toBe(SIMULADO_DISCIPLINE_ID);
      expect(s.plannedMinutes).toBe(120);
    }

    // Terça-feira (27/10, 6 dias após o início na quarta) é dia útil normal e DEVE ter 120 min de estudo (não ser tratado como domingo!)
    const tuesdaySessions = sessions.filter((s) => s.date === '2026-10-27');
    expect(tuesdaySessions.length).toBeGreaterThan(0);
    expect(tuesdaySessions.reduce((sum, s) => sum + s.plannedMinutes, 0)).toBe(120);

    // Segunda-feira (26/10) é dia útil normal, não devendo receber o Simulado de Sábado
    const mondaySessions = sessions.filter((s) => s.date === '2026-10-26');
    expect(mondaySessions.length).toBeGreaterThan(0);
    expect(mondaySessions.every((s) => s.disciplineId !== SIMULADO_DISCIPLINE_ID)).toBe(true);
  });
});
