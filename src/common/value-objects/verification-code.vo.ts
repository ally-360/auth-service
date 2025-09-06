import { InvalidValueObjectException } from '../exceptions/invalid-value-object.exception';

export class VerificationCode {
  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = value;
  }

  private validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new InvalidValueObjectException(
        'Verification code cannot be empty',
      );
    }

    if (value.trim().length === 0) {
      throw new InvalidValueObjectException(
        'Verification code cannot be empty',
      );
    }

    if (value.length < 4) {
      throw new InvalidValueObjectException(
        'Verification code must be at least 4 characters long',
      );
    }

    if (value.length > 10) {
      throw new InvalidValueObjectException(
        'Verification code cannot exceed 10 characters',
      );
    }

    // Validar que solo contenga dígitos
    const codeRegex = /^\d+$/;
    if (!codeRegex.test(value)) {
      throw new InvalidValueObjectException(
        'Verification code can only contain digits',
      );
    }
  }

  getValue(): string {
    return this._value;
  }

  equals(other: VerificationCode): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static fromString(value: string): VerificationCode {
    return new VerificationCode(value);
  }

  static isValid(value: string): boolean {
    try {
      new VerificationCode(value);
      return true;
    } catch {
      return false;
    }
  }

  // Método para generar un código de verificación aleatorio
  static generate(length: number = 6): VerificationCode {
    if (length < 4 || length > 10) {
      throw new InvalidValueObjectException(
        'Verification code length must be between 4 and 10 characters',
      );
    }

    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const code = Math.floor(Math.random() * (max - min + 1)) + min;

    return new VerificationCode(code.toString());
  }
}
