/**
 * Interpretação de checklist em texto (colado pelo usuário) para tópicos e
 * subtópicos. O resultado é sempre apresentado em prévia antes de salvar.
 *
 * Regras:
 * - Linhas vazias são ignoradas.
 * - Linhas indentadas (espaço/tab) ou com numeração de 2+ níveis (ex.: "1.2")
 *   viram subtópicos do último tópico.
 * - Marcadores iniciais ("-", "*", "•", "[ ]", "[x]") são removidos.
 */

export interface ParsedTopic {
  title: string;
  subtopics: string[];
}

const BULLET_RE = /^(?:[-*•–]\s+|\[[ xX]?\]\s*)/;
const MULTI_LEVEL_NUMBER_RE = /^\d+(?:\.\d+)+\.?\s+/;

export function parseChecklist(text: string): ParsedTopic[] {
  const result: ParsedTopic[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    if (!rawLine.trim()) continue;
    const indented = /^[\t ]{2,}|^\t/.test(rawLine);
    let line = rawLine.trim().replace(BULLET_RE, '').trim();
    const isMultiLevel = MULTI_LEVEL_NUMBER_RE.test(line);
    line = line.replace(BULLET_RE, '').trim();
    if (!line) continue;
    const title = line.slice(0, 300);
    if ((indented || isMultiLevel) && result.length > 0) {
      result[result.length - 1].subtopics.push(title);
    } else {
      result.push({ title, subtopics: [] });
    }
  }
  return result;
}

export function countParsed(topics: readonly ParsedTopic[]): { topics: number; subtopics: number } {
  return { topics: topics.length, subtopics: topics.reduce((sum, t) => sum + t.subtopics.length, 0) };
}
