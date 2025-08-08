import { Injectable } from '@nestjs/common';
// import * as genstr from '@supercharge/strings';

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
    return `text.random-${size}`; // genstr.Str().random(size);
  }
}
