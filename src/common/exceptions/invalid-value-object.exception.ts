import { BadRequestException } from '@nestjs/common';

export class InvalidValueObjectException extends BadRequestException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidValueObjectException';
  }
}
