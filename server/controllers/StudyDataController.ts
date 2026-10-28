import type { StudyWorkspaceDto } from '../dtos/study-data.dto';
import type { IStudyDataService } from '../interfaces/IStudyDataService';
import type { AuthenticatedUser } from '../middlewares/authMiddleware';

/**
 * Controlador de Dados de Estudo (SRP & DIP).
 * Todas as operações utilizam estritamente `user.id` extraído do JWT Bearer token.
 */
export class StudyDataController {
  private readonly studyDataService: IStudyDataService;

  constructor(studyDataService: IStudyDataService) {
    this.studyDataService = studyDataService;
  }

  public getWorkspace(user: AuthenticatedUser): { status: number; data: { data: StudyWorkspaceDto } } {
    const workspace = this.studyDataService.getWorkspace(user.id);
    return { status: 200, data: { data: workspace } };
  }

  public executeBatch(
    user: AuthenticatedUser,
    body: unknown,
  ): { status: number; data: { ok: true; data: StudyWorkspaceDto } } {
    const workspace = this.studyDataService.executeBatch(user.id, body);
    return { status: 200, data: { ok: true, data: workspace } };
  }

  public mutateTable(
    user: AuthenticatedUser,
    table: string,
    body: unknown,
  ): { status: number; data: { ok: true } } {
    this.studyDataService.mutateTable(user.id, table, body);
    return { status: 200, data: { ok: true } };
  }

  public replaceWorkspace(
    user: AuthenticatedUser,
    body: unknown,
  ): { status: number; data: { ok: true; data: StudyWorkspaceDto } } {
    const workspace = this.studyDataService.replaceWorkspace(user.id, body);
    return { status: 200, data: { ok: true, data: workspace } };
  }

  public resetWorkspace(
    user: AuthenticatedUser,
  ): { status: number; data: { ok: true; data: StudyWorkspaceDto } } {
    const workspace = this.studyDataService.resetWorkspace(user.id);
    return { status: 200, data: { ok: true, data: workspace } };
  }
}
