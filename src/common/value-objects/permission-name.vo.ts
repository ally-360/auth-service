import { InvalidValueObjectException } from '../exceptions/invalid-value-object.exception';

export class PermissionName {
  private readonly _value: string;

  constructor(resource: string, action: string) {
    this.validate(resource, action);
    this._value = `${resource}:${action}`.toLowerCase();
  }

  private validate(resource: string, action: string): void {
    if (!resource || typeof resource !== 'string') {
      throw new InvalidValueObjectException('Resource cannot be empty');
    }

    if (!action || typeof action !== 'string') {
      throw new InvalidValueObjectException('Action cannot be empty');
    }

    if (resource.trim().length === 0) {
      throw new InvalidValueObjectException('Resource cannot be empty');
    }

    if (action.trim().length === 0) {
      throw new InvalidValueObjectException('Action cannot be empty');
    }

    if (resource.length > 50) {
      throw new InvalidValueObjectException(
        'Resource name cannot exceed 50 characters',
      );
    }

    if (action.length > 20) {
      throw new InvalidValueObjectException(
        'Action name cannot exceed 20 characters',
      );
    }
  }

  getValue(): string {
    return this._value;
  }

  equals(other: PermissionName): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static create(resource: string, action: string): PermissionName {
    return new PermissionName(resource, action);
  }

  static fromString(value: string): PermissionName {
    const parts = value.split(':');
    if (parts.length !== 2) {
      throw new InvalidValueObjectException(
        'PermissionName must be in format "resource:action"',
      );
    }

    return new PermissionName(parts[0], parts[1]);
  }
}
