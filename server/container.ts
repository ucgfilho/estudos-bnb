import { getServerEnv, type ServerEnv } from './config/env';
import { AuthController } from './controllers/AuthController';
import { StudyDataController } from './controllers/StudyDataController';
import { ensureDefaultUserAndFirefoxData } from './database/seedFirefoxData';
import { SqliteDatabaseClient } from './database/SqliteDatabaseClient';
import type { IAuthService } from './interfaces/IAuthService';
import type { IDatabaseClient } from './interfaces/IDatabaseClient';
import type { IPasswordHasher } from './interfaces/IPasswordHasher';
import type { ISensitiveDataCipher } from './interfaces/ISensitiveDataCipher';
import type { IStudyDataRepository } from './interfaces/IStudyDataRepository';
import type { IStudyDataService } from './interfaces/IStudyDataService';
import type { ITokenService } from './interfaces/ITokenService';
import type { IUserRepository } from './interfaces/IUserRepository';
import { BearerAuthGuard } from './middlewares/authMiddleware';
import { SqlStudyDataRepository } from './repositories/SqlStudyDataRepository';
import { SqlUserRepository } from './repositories/SqlUserRepository';
import { JwtTokenService } from './security/JwtTokenService';
import { PasswordHasher } from './security/PasswordHasher';
import { SensitiveDataCipher } from './security/SensitiveDataCipher';
import { AuthService } from './services/AuthService';
import { StudyDataService } from './services/StudyDataService';

export interface AppContainer {
  env: ServerEnv;
  dbClient: IDatabaseClient;
  passwordHasher: IPasswordHasher;
  sensitiveDataCipher: ISensitiveDataCipher;
  tokenService: ITokenService;
  userRepository: IUserRepository;
  studyDataRepository: IStudyDataRepository;
  authService: IAuthService;
  studyDataService: IStudyDataService;
  authGuard: BearerAuthGuard;
  authController: AuthController;
  studyDataController: StudyDataController;
  seedReady: Promise<string>;
}

/**
 * Composition Root (DIP): instancia e injeta todas as dependências do backend.
 */
export function createAppContainer(overrides: Partial<ServerEnv> = {}): AppContainer {
  const env: ServerEnv = {
    ...getServerEnv(),
    ...overrides,
  };

  const dbClient = new SqliteDatabaseClient(env.dbPath);
  const passwordHasher = new PasswordHasher();
  const sensitiveDataCipher = new SensitiveDataCipher(env.jwtSecret);
  const tokenService = new JwtTokenService({
    secret: env.jwtSecret,
    issuer: env.jwtIssuer,
    audience: env.jwtAudience,
    expiresInSeconds: env.jwtExpiresInSeconds,
  });

  const userRepository = new SqlUserRepository(dbClient);
  const studyDataRepository = new SqlStudyDataRepository(dbClient, sensitiveDataCipher);

  const authService = new AuthService(
    userRepository,
    studyDataRepository,
    passwordHasher,
    tokenService,
  );
  const studyDataService = new StudyDataService(studyDataRepository);

  const authGuard = new BearerAuthGuard(tokenService, userRepository);
  const authController = new AuthController(authService);
  const studyDataController = new StudyDataController(studyDataService);

  const seedReady = ensureDefaultUserAndFirefoxData({
    userRepository,
    studyDataRepository,
    passwordHasher,
    email: env.defaultUserEmail,
    password: env.defaultUserPassword,
    name: env.defaultUserName,
    seedFilePath: env.seedFilePath,
  });

  return {
    env,
    dbClient,
    passwordHasher,
    sensitiveDataCipher,
    tokenService,
    userRepository,
    studyDataRepository,
    authService,
    studyDataService,
    authGuard,
    authController,
    studyDataController,
    seedReady,
  };
}
