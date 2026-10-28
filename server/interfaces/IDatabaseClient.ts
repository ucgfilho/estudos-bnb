export type SqlPrimitive = string | number | bigint | Uint8Array | null;

export interface RunResult {
  changes: number | bigint;
  lastInsertRowid: number | bigint;
}

/**
 * Abstração de cliente de banco de dados relacional (DIP & LSP).
 * Permite substituir a infraestrutura de persistência sem alterar repositórios ou serviços.
 */
export interface IDatabaseClient {
  exec(sql: string): void;
  run(sql: string, params?: readonly SqlPrimitive[]): RunResult;
  get<T = Record<string, unknown>>(sql: string, params?: readonly SqlPrimitive[]): T | undefined;
  all<T = Record<string, unknown>>(sql: string, params?: readonly SqlPrimitive[]): T[];
  transaction<T>(fn: () => T): T;
  close(): void;
}
