import { InvalidValueObjectException } from '../exceptions/invalid-value-object.exception';

export class Token {
  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = value;
  }

  private validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new InvalidValueObjectException('Token cannot be empty');
    }

    if (value.trim().length === 0) {
      throw new InvalidValueObjectException('Token cannot be empty');
    }

    if (value.length < 32) {
      throw new InvalidValueObjectException(
        'Token must be at least 32 characters long',
      );
    }

    if (value.length > 500) {
      throw new InvalidValueObjectException(
        'Token cannot exceed 500 characters',
      );
    }
  }

  getValue(): string {
    return this._value;
  }

  equals(other: Token): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static fromString(value: string): Token {
    return new Token(value);
  }

  static isValid(value: string): boolean {
    try {
      new Token(value);
      return true;
    } catch {
      return false;
    }
  }
}
