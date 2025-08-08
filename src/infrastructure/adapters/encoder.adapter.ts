import { Injectable } from '@nestjs/common';
// import * as bcrypt from 'bcryptjs';

export interface HashService {
  /**
   * * Service that returns an encrypted password
   * @param password Password to be encrypted
   * @returns
   */
  encodePassword: (password: string) => Promise<string>;
  /**
   * * Service that performs a comparison of a user password versus a previously encrypted password.
   * @param password Encrypted password
   * @param userPassword User password with which we will perform the validation.
   * @returns boolean value depending on the result of the comparison
   */
  checkPassword: (password: string, userPassword: string) => Promise<boolean>;
}

@Injectable()
export class EncoderAdapter {
  // implements HashService {
  constructor() {}

  // public async encodePassword(p: string): Promise<string> {
  //   return await bcrypt.hash(p, await bcrypt.genSalt());
  // }

  // public async checkPassword(p: string, up: string): Promise<boolean> {
  //   return await bcrypt.compare(p, up);
  // }

  public encodePassword(p: string): string {
    return `hash-${p}`; // await bcrypt.hash(p, await bcrypt.genSalt());
  }

  public checkPassword(p: string, up: string): boolean {
    console.log(p, up);
    return true; // await bcrypt.compare(p, up);
  }
}
