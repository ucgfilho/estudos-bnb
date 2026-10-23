import { db } from '../db/db';
import type { MockExam, MockExamRange } from '../db/types';
import {
  keyedQuestions,
  normalizeMarked,
  optionLetters,
  validateRanges,
  gradeExam,
  type AnswerKey,
  type GradedExam,
  type Responses,
} from '../domain/mockExam';
import { createId, nowIso } from '../lib/utils';
import { ValidationError } from './sessions';

export interface CreateMockExamInput {
  title: string;
  examFileName?: string | null;
  keyFileName?: string | null;
  answerKey: AnswerKey;
  questionCount: number;
  optionCount: number;
  ranges?: MockExamRange[];
}

export function keyToRecord(key: AnswerKey): Record<string, string> {
  return Object.fromEntries(Object.entries(key).map(([n, a]) => [String(n), a]));
}

export function recordToKey(record: Record<string, string>): AnswerKey {
  return Object.fromEntries(Object.entries(record).map(([n, a]) => [Number(n), a]));
}

export function recordToResponses(record: Record<string, string | null>): Responses {
  return Object.fromEntries(Object.entries(record).map(([n, a]) => [Number(n), a]));
}

export function gradeStoredExam(exam: MockExam): GradedExam {
  return gradeExam(recordToKey(exam.answerKey), recordToResponses(exam.responses), exam.questionCount, exam.ranges);
}

export async function createMockExam(input: CreateMockExamInput): Promise<MockExam> {
  const title = input.title.trim();
  if (!title) throw new ValidationError('Informe um nome para o simulado.');
  if (keyedQuestions(input.answerKey, input.questionCount).length === 0) {
    throw new ValidationError('O gabarito não possui questões.');
  }
  const ranges = input.ranges ?? [];
  const rangeErrors = validateRanges(ranges, input.questionCount);
  if (rangeErrors.length > 0) throw new ValidationError(rangeErrors[0]);

  const now = nowIso();
  const exam: MockExam = {
    id: createId(),
    title,
    examFileName: input.examFileName ?? null,
    keyFileName: input.keyFileName ?? null,
    questionCount: input.questionCount,
    optionCount: Math.min(Math.max(input.optionCount, 2), 5),
    answerKey: keyToRecord(input.answerKey),
    ranges,
    responses: {},
    submittedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  await db.mockExams.add(exam);
  return exam;
}

async function getEditableExam(id: string): Promise<MockExam> {
  const exam = await db.mockExams.get(id);
  if (!exam) throw new ValidationError('Simulado não encontrado.');
  return exam;
}

/** Registra (ou limpa, com `null`) a resposta de uma questão antes do envio. */
export async function setMockExamAnswer(id: string, question: number, letter: string | null): Promise<MockExam> {
  const exam = await getEditableExam(id);
  if (exam.submittedAt) throw new ValidationError('Este simulado já foi enviado.');
  if (!Number.isInteger(question) || question < 1 || question > exam.questionCount) {
    throw new ValidationError('Questão inexistente neste simulado.');
  }
  const normalized = normalizeMarked(letter);
  if (letter && (!normalized || !optionLetters(exam.optionCount).includes(normalized))) {
    throw new ValidationError('Alternativa inválida para este simulado.');
  }
  const responses = { ...exam.responses };
  if (normalized) responses[String(question)] = normalized;
  else delete responses[String(question)];
  const updated = { ...exam, responses, updatedAt: nowIso() };
  await db.mockExams.put(updated);
  return updated;
}

/** Envia as respostas: após isso o simulado fica travado e o resultado é calculado. */
export async function submitMockExam(id: string): Promise<{ exam: MockExam; graded: GradedExam }> {
  const exam = await getEditableExam(id);
  if (exam.submittedAt) throw new ValidationError('Este simulado já foi enviado.');
  const now = nowIso();
  const updated = { ...exam, submittedAt: now, updatedAt: now };
  await db.mockExams.put(updated);
  return { exam: updated, graded: gradeStoredExam(updated) };
}

/** Reabre o simulado para novas marcações (descarta o resultado, mantém as respostas). */
export async function reopenMockExam(id: string): Promise<MockExam> {
  const exam = await getEditableExam(id);
  const updated = { ...exam, submittedAt: null, updatedAt: nowIso() };
  await db.mockExams.put(updated);
  return updated;
}

export async function deleteMockExam(id: string): Promise<void> {
  await db.mockExams.delete(id);
}
