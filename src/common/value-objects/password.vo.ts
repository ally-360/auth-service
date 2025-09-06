import { InvalidValueObjectException } from '../exceptions/invalid-value-object.exception';

export class Password {
  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = value;
  }

  private validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new InvalidValueObjectException('Password cannot be empty');
    }

    if (value.length < 8) {
      throw new InvalidValueObjectException(
        'Password must be at least 8 characters long',
      );
    }

    if (value.length > 128) {
      throw new InvalidValueObjectException('Password is too long');
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(value)) {
      throw new InvalidValueObjectException(
        'Password must contain at least one uppercase letter',
      );
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(value)) {
      throw new InvalidValueObjectException(
        'Password must contain at least one lowercase letter',
      );
    }

    // Check for at least one number
    if (!/\d/.test(value)) {
      throw new InvalidValueObjectException(
        'Password must contain at least one number',
      );
    }

    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      throw new InvalidValueObjectException(
        'Password must contain at least one special character',
      );
    }
  }

  getValue(): string {
    return this._value;
  }

  equals(other: Password): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static create(value: string): Password {
    return new Password(value);
  }

  static fromString(value: string): Password {
    return new Password(value);
  }

  // Method to validate password strength without creating instance
  static isValid(value: string): boolean {
    try {
      new Password(value);
      return true;
    } catch {
      return false;
    }
  }
}
