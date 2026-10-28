import type { DataTableName } from '../../src/db/types';
import type { StudyWorkspaceDto } from '../dtos/study-data.dto';

/**
 * Contrato do serviço de domínio dos dados de estudo do usuário (ISP & DIP).
 */
export interface IStudyDataService {
  getWorkspace(userId: string): StudyWorkspaceDto;
  executeBatch(userId: string, rawBody: unknown): StudyWorkspaceDto;
  mutateTable(userId: string, tableParam: string, rawBody: unknown): void;
  replaceWorkspace(userId: string, rawBody: unknown): StudyWorkspaceDto;
  resetWorkspace(userId: string): StudyWorkspaceDto;
  parseTableName(tableParam: string): DataTableName;
}
