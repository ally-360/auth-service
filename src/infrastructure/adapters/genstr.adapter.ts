import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

export interface StrBase {
  generate: (size: number) => string;
}

@Injectable()
export class GenstrAdapter implements StrBase {
  /**
   * * Service that returns a token for validations.
   * @param size Length of the token to be returned
   * @returns
   */
  public generate(size: number): string {
    // Generate a URL-safe random string of the requested size
    // Using base64url and trimming to exact length to reduce bias and keep it compact
    const bytes = Math.ceil((size * 3) / 4);
    return randomBytes(bytes).toString('base64url').slice(0, size);
  }
}
