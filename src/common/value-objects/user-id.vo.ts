import { InvalidValueObjectException } from '../exceptions/invalid-value-object.exception';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export class UserId {
  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = value;
  }

  private validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new InvalidValueObjectException('User ID cannot be empty');
    }

    if (!uuidValidate(value)) {
      throw new InvalidValueObjectException('User ID must be a valid UUID');
    }
  }

  getValue(): string {
    return this._value;
  }

  equals(other: UserId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static create(): UserId {
    return new UserId(uuidv4());
  }

  static fromString(value: string): UserId {
    return new UserId(value);
  }

  static isValid(value: string): boolean {
    try {
      new UserId(value);
      return true;
    } catch {
      return false;
    }
  }
}
