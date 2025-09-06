import { InvalidValueObjectException } from '../exceptions/invalid-value-object.exception';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export class PermissionId {
  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = value;
  }

  private validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new InvalidValueObjectException('Permission ID cannot be empty');
    }

    if (!uuidValidate(value)) {
      throw new InvalidValueObjectException(
        'Permission ID must be a valid UUID',
      );
    }
  }

  getValue(): string {
    return this._value;
  }

  equals(other: PermissionId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static create(): PermissionId {
    return new PermissionId(uuidv4());
  }

  static fromString(value: string): PermissionId {
    return new PermissionId(value);
  }

  static isValid(value: string): boolean {
    try {
      new PermissionId(value);
      return true;
    } catch {
      return false;
    }
  }
}
