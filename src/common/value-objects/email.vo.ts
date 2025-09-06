import { InvalidValueObjectException } from '../exceptions/invalid-value-object.exception';

export class Email {
  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = value.toLowerCase().trim();
  }

  private validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new InvalidValueObjectException('Email cannot be empty');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new InvalidValueObjectException('Email cannot be empty');
    }

    if (trimmedValue.length > 254) {
      throw new InvalidValueObjectException('Email is too long');
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedValue)) {
      throw new InvalidValueObjectException('Invalid email format');
    }
  }

  getValue(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static create(value: string): Email {
    return new Email(value);
  }

  static fromString(value: string): Email {
    return new Email(value);
  }
}
