import type { DataTableName } from '../db/types';

export interface AuthUserDto {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthSessionDto {
  token: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: AuthUserDto;
}

export interface LoginInputDto {
  email: string;
  password: string;
}

export interface RegisterInputDto {
  name: string;
  email: string;
  password: string;
}

export type RemoteTableMutation =
  | { table: DataTableName; action: 'upsert'; records: unknown[] }
  | { table: DataTableName; action: 'delete'; ids: string[] }
  | { table: DataTableName; action: 'clear' };

const AUTH_STORAGE_KEY = 'bnb_auth_session_v1';

type AuthListener = () => void;
const authListeners = new Set<AuthListener>();

let cachedSession: AuthSessionDto | null = loadStoredSession();

function loadStoredSession(): AuthSessionDto | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSessionDto;
    if (!parsed || typeof parsed.token !== 'string' || !parsed.user?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

function notifyAuthListeners(): void {
  for (const listener of authListeners) {
    listener();
  }
}

export function subscribeAuth(listener: AuthListener): () => void {
  authListeners.add(listener);
  return () => {
    authListeners.delete(listener);
  };
}

export function getAuthSession(): AuthSessionDto | null {
  return cachedSession;
}

export function getAuthToken(): string | null {
  return cachedSession?.token ?? null;
}

export function setAuthSession(session: AuthSessionDto | null): void {
  cachedSession = session;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (session) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      } else {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // Ignore storage quota errors
    }
  }
  notifyAuthListeners();
}

export function buildBearerHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function parseApiJson<T>(res: Response): Promise<T> {
  const body = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) {
    if (res.status === 401) {
      setAuthSession(null);
    }
    throw new Error(body.error ?? `Erro na requisição (${res.status}).`);
  }
  return body;
}

export async function loginWithCredentials(input: LoginInputDto): Promise<AuthSessionDto> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const session = await parseApiJson<AuthSessionDto>(res);
  setAuthSession(session);
  return session;
}

export async function registerUserAccount(input: RegisterInputDto): Promise<AuthSessionDto> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const session = await parseApiJson<AuthSessionDto>(res);
  setAuthSession(session);
  return session;
}

export async function verifyCurrentSession(): Promise<AuthUserDto | null> {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      headers: buildBearerHeaders(),
    });
    const data = await parseApiJson<{ user: AuthUserDto }>(res);
    if (cachedSession) {
      setAuthSession({ ...cachedSession, user: data.user });
    }
    return data.user;
  } catch {
    return null;
  }
}

export async function deleteUserAccount(): Promise<void> {
  const token = getAuthToken();
  if (token && token !== TEST_BYPASS_TOKEN) {
    const res = await fetch('/api/auth/me', {
      method: 'DELETE',
      headers: buildBearerHeaders(),
    });
    await parseApiJson<{ deleted: boolean }>(res);
  }
  setAuthSession(null);
}

export const TEST_BYPASS_TOKEN = 'test-jwt-token';

export async function fetchUserWorkspaceFromApi(): Promise<Record<DataTableName, unknown[]> | null> {
  const token = getAuthToken();
  if (!token || token === TEST_BYPASS_TOKEN) return null;
  const res = await fetch('/api/study-data', {
    method: 'GET',
    headers: buildBearerHeaders(),
  });
  const body = await parseApiJson<{ data: Record<DataTableName, unknown[]> }>(res);
  return body.data;
}

export async function syncBatchMutationsToApi(operations: readonly RemoteTableMutation[]): Promise<void> {
  const token = getAuthToken();
  if (!token || token === TEST_BYPASS_TOKEN || operations.length === 0) return;
  try {
    const res = await fetch('/api/study-data/batch', {
      method: 'POST',
      headers: buildBearerHeaders(),
      body: JSON.stringify({ operations }),
    });
    if (res.status === 401) {
      setAuthSession(null);
    }
  } catch (err) {
    console.error('Falha ao sincronizar alterações com o banco de dados:', err);
  }
}
