import type { DataTableName } from '../../src/db/types';
import type { StudyWorkspaceDto, TableMutationOperationDto } from '../dtos/study-data.dto';

/**
 * Contrato de persistência para todos os dados de estudo intrinsecamente vinculados ao usuário (ISP & DIP).
 */
export interface IStudyDataRepository {
  ensureUserSeed(userId: string): void;
  getWorkspace(userId: string): StudyWorkspaceDto;
  replaceWorkspace(userId: string, workspace: StudyWorkspaceDto): StudyWorkspaceDto;
  resetWorkspace(userId: string): StudyWorkspaceDto;
  applyBatch(userId: string, operations: readonly TableMutationOperationDto[]): void;
  upsertTable(userId: string, table: DataTableName, records: readonly unknown[]): void;
  deleteFromTable(userId: string, table: DataTableName, ids: readonly string[]): void;
  clearTable(userId: string, table: DataTableName): void;
}
