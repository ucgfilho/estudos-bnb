import { describe, it, expect } from 'vitest';
import {
  validateQuestionForm,
  findDuplicateLog,
  type QuestionFormValues,
} from '../../domain/questions';
import type { QuestionLog } from '../../db/types';

describe('domain/questions - validation rules', () => {
  it('validates non-negative integer values', () => {
    const invalidForm: QuestionFormValues = {
      date: '2026-10-14',
      disciplineId: 'portugues',
      topicId: '',
      source: '',
      total: '10',
      correct: '-2', // negative!
      incorrect: '8',
      blank: '',
      durationMinutes: '',
      notes: '',
    };
    const result = validateQuestionForm(invalidForm);
    expect(result.value).toBeNull();
    expect(result.errors.correct).toBeDefined();
  });

  it('rejects decimal numbers for questions', () => {
    const decimalForm: QuestionFormValues = {
      date: '2026-10-14',
      disciplineId: 'portugues',
      topicId: '',
      source: '',
      total: '10.5',
      correct: '5.2',
      incorrect: '5.3',
      blank: '',
      durationMinutes: '',
      notes: '',
    };
    const result = validateQuestionForm(decimalForm);
    expect(result.value).toBeNull();
    expect(result.errors.total).toBeDefined();
  });

  it('calculates total automatically when total is left empty', () => {
    const form: QuestionFormValues = {
      date: '2026-10-14',
      disciplineId: 'engenharia',
      topicId: '',
      source: 'FCC',
      total: '', // left empty
      correct: '12',
      incorrect: '3',
      blank: '2',
      durationMinutes: '45',
      notes: '',
    };
    const result = validateQuestionForm(form);
    expect(result.errors).toEqual({});
    expect(result.totalWasComputed).toBe(true);
    expect(result.value?.total).toBe(17);
    expect(result.value?.correct).toBe(12);
    expect(result.value?.incorrect).toBe(3);
    expect(result.value?.blank).toBe(2);
  });

  it('warns when total is greater than classified questions', () => {
    const form: QuestionFormValues = {
      date: '2026-10-14',
      disciplineId: 'logica-programacao',
      topicId: '',
      source: '',
      total: '20',
      correct: '10',
      incorrect: '5',
      blank: '0',
      durationMinutes: '',
      notes: '',
    };
    const result = validateQuestionForm(form);
    expect(result.errors).toEqual({});
    expect(result.unclassified).toBe(5); // 20 - (10 + 5) = 5
  });

  it('rejects when classified exceeds total', () => {
    const form: QuestionFormValues = {
      date: '2026-10-14',
      disciplineId: 'nuvem',
      topicId: '',
      source: '',
      total: '10',
      correct: '8',
      incorrect: '5', // 8 + 5 = 13 > 10
      blank: '0',
      durationMinutes: '',
      notes: '',
    };
    const result = validateQuestionForm(form);
    expect(result.value).toBeNull();
    expect(result.errors.total).toContain('mais que o total informado');
  });

  it('detects duplicate logs to prevent silent duplicates', () => {
    const existing: QuestionLog[] = [
      {
        id: 'log-1',
        date: '2026-10-14',
        disciplineId: 'portugues',
        topicId: null,
        source: 'Cespe 2024',
        total: 20,
        correct: 16,
        incorrect: 4,
        blank: 0,
        durationMinutes: 30,
        notes: '',
        sessionId: null,
        createdAt: '',
        updatedAt: '',
      },
    ];

    const duplicateCandidate = {
      date: '2026-10-14',
      disciplineId: 'portugues',
      topicId: null,
      source: 'Cespe 2024',
      total: 20,
      correct: 16,
      incorrect: 4,
      blank: 0,
      durationMinutes: 30,
      notes: '',
    };

    const duplicate = findDuplicateLog(duplicateCandidate, existing);
    expect(duplicate).not.toBeNull();
    expect(duplicate?.id).toBe('log-1');

    // Different source should not be treated as duplicate
    const differentCandidate = {
      ...duplicateCandidate,
      source: 'FCC 2024',
    };
    expect(findDuplicateLog(differentCandidate, existing)).toBeNull();
  });
});
