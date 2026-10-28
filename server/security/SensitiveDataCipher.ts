import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';
import type { ISensitiveDataCipher } from '../interfaces/ISensitiveDataCipher';

const CIPHER_PREFIX = '$aes256gcm$';
const KEY_SALT = 'bnb-estudos-lgpd-at-rest-key-derivation-v1';

/**
 * Criptografia autenticada em repouso (AES-256-GCM) para dados sensíveis (LGPD Art. 46).
 */
export class SensitiveDataCipher implements ISensitiveDataCipher {
  private readonly key: Buffer;

  constructor(masterSecret: string) {
    this.key = scryptSync(masterSecret, KEY_SALT, 32);
  }

  public encrypt(plaintext: string): string {
    if (!plaintext) return '';
    if (plaintext.startsWith(CIPHER_PREFIX)) return plaintext;

    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `${CIPHER_PREFIX}${iv.toString('hex')}$${authTag.toString('hex')}$${encrypted.toString('hex')}`;
  }

  public decrypt(storedValue: string): string {
    if (!storedValue) return '';
    if (!storedValue.startsWith(CIPHER_PREFIX)) {
      return storedValue;
    }

    const parts = storedValue.slice(CIPHER_PREFIX.length).split('$');
    if (parts.length !== 3) return '';

    const [ivHex, authTagHex, encryptedHex] = parts;
    try {
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');
      const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
      decipher.setAuthTag(authTag);
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
      return decrypted.toString('utf8');
    } catch {
      return '';
    }
  }
}
