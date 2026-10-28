export interface ISensitiveDataCipher {
  encrypt(plaintext: string): string;
  decrypt(storedValue: string): string;
}
