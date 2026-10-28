/**
 * Contrato para hashing e verificação criptográfica de senhas (ISP & DIP).
 */
export interface IPasswordHasher {
  hash(plainPassword: string): Promise<string>;
  verify(plainPassword: string, passwordHash: string): Promise<boolean>;
}
