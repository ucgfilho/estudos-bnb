export interface UserEntity {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Contrato de persistência da entidade Usuário (ISP & DIP).
 */
export interface IUserRepository {
  findByEmail(email: string): UserEntity | null;
  findById(id: string): UserEntity | null;
  create(user: CreateUserRecord): UserEntity;
  deleteById(id: string): boolean;
}
