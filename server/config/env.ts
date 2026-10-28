import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const runtimeFallbackSecret = randomBytes(48).toString('hex');

function loadDotEnvIfNeeded(): void {
  try {
    const envPath = resolve(process.cwd(), '.env');
    if (!existsSync(envPath)) return;
    const content = readFileSync(envPath, 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eqIdx = line.indexOf('=');
      if (eqIdx <= 0) continue;
      const key = line.slice(0, eqIdx).trim();
      const val = line.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  } catch {
    // Ignore .env read errors in restricted environments
  }
}

export interface ServerEnv {
  port: number;
  nodeEnv: string;
  dbPath: string;
  seedFilePath: string;
  jwtSecret: string;
  jwtIssuer: string;
  jwtAudience: string;
  jwtExpiresInSeconds: number;
  defaultUserEmail: string;
  defaultUserPassword: string;
  defaultUserName: string;
}

export function getServerEnv(): ServerEnv {
  loadDotEnvIfNeeded();

  const rawSecret = process.env.JWT_SECRET?.trim();
  const jwtSecret =
    rawSecret && rawSecret.length >= 16 ? rawSecret : runtimeFallbackSecret;

  return {
    port: Number(process.env.PORT ?? 3000),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    dbPath: process.env.DB_PATH ?? resolve(process.cwd(), 'data', 'bnb_estudos.sqlite'),
    seedFilePath:
      process.env.SEED_FILE_PATH ??
      resolve(process.cwd(), 'data', 'initial-workspace.seed.json'),
    jwtSecret,
    jwtIssuer: process.env.JWT_ISSUER ?? 'bnb-estudos-api',
    jwtAudience: process.env.JWT_AUDIENCE ?? 'bnb-estudos-client',
    jwtExpiresInSeconds: Number(process.env.JWT_EXPIRES_IN ?? 60 * 60 * 24 * 7), // 7 days
    defaultUserEmail: (process.env.DEFAULT_USER_EMAIL ?? '').trim(),
    defaultUserPassword: process.env.DEFAULT_USER_PASSWORD ?? '',
    defaultUserName: (process.env.DEFAULT_USER_NAME ?? '').trim(),
  };
}
