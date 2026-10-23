/** Validação do registro de questões. */
import { isValidDateKey } from '../lib/dates';
import type { QuestionLog } from '../db/types';

export interface QuestionFormValues {
  date: string;
  disciplineId: string;
  topicId: string;
  source: string;
  total: string;
  correct: string;
  incorrect: string;
  blank: string;
  durationMinutes: string;
  notes: string;
}

export interface NormalizedQuestionValues {
  date: string;
  disciplineId: string;
  topicId: string | null;
  source: string;
  total: number;
  correct: number;
  incorrect: number;
  blank: number;
  durationMinutes: number | null;
  notes: string;
}

export type QuestionFieldErrors = Partial<Record<keyof QuestionFormValues, string>>;

export interface QuestionValidationResult {
  errors: QuestionFieldErrors;
  /** Questões informadas no total mas não classificadas como acerto/erro/branco. */
  unclassified: number;
  /** Total calculado automaticamente a partir de acertos + erros + brancos. */
  totalWasComputed: boolean;
  value: NormalizedQuestionValues | null;
}

type ParsedInt = { kind: 'empty' } | { kind: 'invalid' } | { kind: 'ok'; value: number };

/** Interpreta um campo como inteiro não negativo. */
export function parseNonNegativeInt(raw: string): ParsedInt {
  const text = raw.trim();
  if (text === '') return { kind: 'empty' };
  if (!/^\d+$/.test(text)) return { kind: 'invalid' };
  const value = Number(text);
  if (!Number.isSafeInteger(value)) return { kind: 'invalid' };
  return { kind: 'ok', value };
}

const INVALID_INT = 'Informe um número inteiro maior ou igual a zero.';

export function validateQuestionForm(values: QuestionFormValues): QuestionValidationResult {
  const errors: QuestionFieldErrors = {};

  if (!isValidDateKey(values.date)) errors.date = 'Informe uma data válida.';
  if (!values.disciplineId) errors.disciplineId = 'Selecione a disciplina.';

  const numeric = (field: 'total' | 'correct' | 'incorrect' | 'blank' | 'durationMinutes') => {
    const parsed = parseNonNegativeInt(values[field]);
    if (parsed.kind === 'invalid') errors[field] = INVALID_INT;
    return parsed;
  };

  const total = numeric('total');
  const correct = numeric('correct');
  const incorrect = numeric('incorrect');
  const blank = numeric('blank');
  const duration = numeric('durationMinutes');

  const c = correct.kind === 'ok' ? correct.value : 0;
  const i = incorrect.kind === 'ok' ? incorrect.value : 0;
  const b = blank.kind === 'ok' ? blank.value : 0;
  const classified = c + i + b;

  let totalValue = 0;
  let totalWasComputed = false;
  if (total.kind === 'ok') {
    totalValue = total.value;
  } else if (total.kind === 'empty') {
    totalValue = classified;
    totalWasComputed = true;
  }

  if (!errors.total && !errors.correct && !errors.incorrect && !errors.blank) {
    if (totalValue <= 0) {
      errors.total = 'Informe o total de questões ou a quantidade de acertos e erros.';
    } else if (classified > totalValue) {
      errors.total = `Acertos, erros e em branco somam ${classified}, mais que o total informado (${totalValue}).`;
    }
  }

  const unclassified = !errors.total && totalValue > classified ? totalValue - classified : 0;

  if (Object.keys(errors).length > 0) {
    return { errors, unclassified, totalWasComputed, value: null };
  }

  return {
    errors,
    unclassified,
    totalWasComputed,
    value: {
      date: values.date,
      disciplineId: values.disciplineId,
      topicId: values.topicId || null,
      source: values.source.trim(),
      total: totalValue,
      correct: c,
      incorrect: i,
      blank: b,
      durationMinutes: duration.kind === 'ok' ? duration.value : null,
      notes: values.notes.trim(),
    },
  };
}

/** Procura um lançamento idêntico já existente (para evitar duplicação silenciosa). */
export function findDuplicateLog(
  value: NormalizedQuestionValues,
  existing: readonly QuestionLog[],
  ignoreId?: string,
): QuestionLog | null {
  return (
    existing.find(
      (l) =>
        l.id !== ignoreId &&
        l.date === value.date &&
        l.disciplineId === value.disciplineId &&
        (l.topicId ?? null) === value.topicId &&
        l.source.trim().toLowerCase() === value.source.toLowerCase() &&
        l.total === value.total &&
        l.correct === value.correct &&
        l.incorrect === value.incorrect &&
        l.blank === value.blank,
    ) ?? null
  );
}

export function emptyQuestionForm(date: string, disciplineId = '', topicId = ''): QuestionFormValues {
  return {
    date,
    disciplineId,
    topicId,
    source: '',
    total: '',
    correct: '',
    incorrect: '',
    blank: '',
    durationMinutes: '',
    notes: '',
  };
}

export function questionLogToForm(log: QuestionLog): QuestionFormValues {
  return {
    date: log.date,
    disciplineId: log.disciplineId,
    topicId: log.topicId ?? '',
    source: log.source,
    total: String(log.total),
    correct: String(log.correct),
    incorrect: String(log.incorrect),
    blank: String(log.blank),
    durationMinutes: log.durationMinutes === null ? '' : String(log.durationMinutes),
    notes: log.notes,
  };
}
