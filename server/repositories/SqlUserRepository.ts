import type { IDatabaseClient } from '../interfaces/IDatabaseClient';
import type { CreateUserRecord, IUserRepository, UserEntity } from '../interfaces/IUserRepository';

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

function mapUserRow(row: UserRow): UserEntity {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Implementação concreta de IUserRepository (SRP, LSP & DIP).
 * Todas as queries utilizam parâmetros preparados contra SQL Injection.
 */
export class SqlUserRepository implements IUserRepository {
  private readonly db: IDatabaseClient;

  constructor(db: IDatabaseClient) {
    this.db = db;
  }

  public findByEmail(email: string): UserEntity | null {
    const normalized = email.trim().toLowerCase();
    const row = this.db.get<UserRow>(
      `SELECT id, name, email, password_hash, created_at, updated_at
       FROM users
       WHERE LOWER(email) = ?
       LIMIT 1`,
      [normalized],
    );
    return row ? mapUserRow(row) : null;
  }

  public findById(id: string): UserEntity | null {
    const row = this.db.get<UserRow>(
      `SELECT id, name, email, password_hash, created_at, updated_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id],
    );
    return row ? mapUserRow(row) : null;
  }

  public create(user: CreateUserRecord): UserEntity {
    const normalizedEmail = user.email.trim().toLowerCase();
    this.db.run(
      `INSERT INTO users (id, name, email, password_hash, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user.id, user.name.trim(), normalizedEmail, user.passwordHash, user.createdAt, user.updatedAt],
    );
    return {
      ...user,
      name: user.name.trim(),
      email: normalizedEmail,
    };
  }

  public deleteById(id: string): boolean {
    const result = this.db.run(`DELETE FROM users WHERE id = ?`, [id]);
    return result.changes > 0;
  }
}
