import { InvalidValueObjectException } from '../exceptions/invalid-value-object.exception';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export class RoleId {
  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = value;
  }

  private validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new InvalidValueObjectException('Role ID cannot be empty');
    }

    if (!uuidValidate(value)) {
      throw new InvalidValueObjectException('Role ID must be a valid UUID');
    }
  }

  getValue(): string {
    return this._value;
  }

  equals(other: RoleId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static create(): RoleId {
    return new RoleId(uuidv4());
  }

  static fromString(value: string): RoleId {
    return new RoleId(value);
  }

  static isValid(value: string): boolean {
    try {
      new RoleId(value);
      return true;
    } catch {
      return false;
    }
  }
}
