import type { DataTableName } from '../../src/db/types';
import {
  parseBatchRequestDto,
  parseSingleTableMutationDto,
  parseStudyWorkspaceDto,
  tableNameSchema,
  type StudyWorkspaceDto,
} from '../dtos/study-data.dto';
import { DtoValidationError } from '../errors/AppError';
import type { IStudyDataRepository } from '../interfaces/IStudyDataRepository';
import type { IStudyDataService } from '../interfaces/IStudyDataService';

/**
 * Serviço de domínio para gerenciamento dos dados de estudo do usuário (SRP, OCP & DIP).
 */
export class StudyDataService implements IStudyDataService {
  private readonly repository: IStudyDataRepository;

  constructor(repository: IStudyDataRepository) {
    this.repository = repository;
  }

  public parseTableName(tableParam: string): DataTableName {
    const parsed = tableNameSchema.safeParse(tableParam);
    if (!parsed.success) {
      throw new DtoValidationError(`Tabela inválida: ${tableParam}`);
    }
    return parsed.data;
  }

  public getWorkspace(userId: string): StudyWorkspaceDto {
    return this.repository.getWorkspace(userId);
  }

  public executeBatch(userId: string, rawBody: unknown): StudyWorkspaceDto {
    const dto = parseBatchRequestDto(rawBody);
    this.repository.applyBatch(userId, dto.operations);
    return this.repository.getWorkspace(userId);
  }

  public mutateTable(userId: string, tableParam: string, rawBody: unknown): void {
    const table = this.parseTableName(tableParam);
    const dto = parseSingleTableMutationDto(rawBody);
    if (dto.action === 'clear') {
      this.repository.clearTable(userId, table);
    } else if (dto.action === 'delete') {
      this.repository.deleteFromTable(userId, table, dto.ids);
    } else {
      this.repository.upsertTable(userId, table, dto.records);
    }
  }

  public replaceWorkspace(userId: string, rawBody: unknown): StudyWorkspaceDto {
    const payload =
      rawBody && typeof rawBody === 'object' && 'data' in rawBody
        ? (rawBody as { data: unknown }).data
        : rawBody;
    const dto = parseStudyWorkspaceDto(payload);
    return this.repository.replaceWorkspace(userId, dto);
  }

  public resetWorkspace(userId: string): StudyWorkspaceDto {
    return this.repository.resetWorkspace(userId);
  }
}
