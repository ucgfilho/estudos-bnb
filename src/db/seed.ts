import type { Discipline, Settings } from './types';
import { SETTINGS_ID } from './types';

/** As oito disciplinas do cargo Analista de Sistemas — Desenvolvimento de Sistemas. */
export const DEFAULT_DISCIPLINES: Discipline[] = [
  { id: 'portugues', name: 'Língua Portuguesa', color: '#f68b1f', active: true, order: 0, kind: 'general' },
  { id: 'raciocinio', name: 'Raciocínio Lógico e Quantitativo', color: '#ffcb05', active: true, order: 1, kind: 'general' },
  { id: 'logica-programacao', name: 'Lógica de Programação', color: '#0996b6', active: true, order: 2, kind: 'technical' },
  { id: 'arquitetura', name: 'Arquitetura de Software', color: '#a6193c', active: true, order: 3, kind: 'technical' },
  { id: 'engenharia', name: 'Engenharia de Software', color: '#07a684', active: true, order: 4, kind: 'technical' },
  { id: 'linguagens', name: 'Linguagens e Tecnologias de Programação', color: '#ba2172', active: true, order: 5, kind: 'technical' },
  { id: 'banco-dados', name: 'Banco de Dados', color: '#004b2c', active: true, order: 6, kind: 'technical' },
  { id: 'nuvem', name: 'Computação em Nuvem', color: '#646464', active: true, order: 7, kind: 'technical' },
];

/**
 * Distribuição inicial sugerida: 600 min (10 h) para as 6 disciplinas técnicas
 * (100 min cada) e 240 min (4 h) para Português e Raciocínio (120 min cada).
 * Totaliza a meta semanal de 840 min. Editável nas telas de cronograma.
 */
export const DEFAULT_DISTRIBUTION: Record<string, number> = {
  portugues: 120,
  raciocinio: 120,
  'logica-programacao': 100,
  arquitetura: 100,
  engenharia: 100,
  linguagens: 100,
  'banco-dados': 100,
  nuvem: 100,
};

export const DEFAULT_SETTINGS: Settings = {
  id: SETTINGS_ID,
  dailyGoalMinutes: 120,
  weeklyGoalMinutes: 840,
  dailyQuestionGoal: null,
  accuracyGoal: 80,
  topicCompletionGoal: null,
  reviewIntervals: [1, 7, 30],
  theme: 'system',
  examDate: null,
  scheduleStartDate: null,
  scheduleWeeks: 24,
  distribution: { ...DEFAULT_DISTRIBUTION },
  geminiApiKey: '',
  aiProvider: 'builtin',
};
