import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoAdapter {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key = crypto.scryptSync('mi-segura-clave', 'salt', 32); // 32 bytes key
  private readonly iv = crypto.randomBytes(16); // 16 bytes IV
  /**
   * Encripta un texto utilizando AES-256-CBC
   */
  encrypt(text: string): string {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${this.iv.toString('hex')}:${encrypted}`;
  }
  /**
   * Desencripta un texto encriptado con AES-256-CBC
   */
  decrypt(encryptedText: string): string {
    const [iv, encrypted] = encryptedText.split(':');
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, 'hex'),
    );
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
