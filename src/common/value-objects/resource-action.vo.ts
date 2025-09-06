import { InvalidValueObjectException } from '../exceptions/invalid-value-object.exception';

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

export class ResourceAction {
  private readonly _resource: string;
  private readonly _action: Action;

  constructor(resource: string, action: Action) {
    this.validateResource(resource);
    this.validateAction(action);
    this._resource = resource.toLowerCase();
    this._action = action;
  }

  private validateResource(resource: string): void {
    if (!resource || typeof resource !== 'string') {
      throw new InvalidValueObjectException('Resource cannot be empty');
    }

    if (resource.trim().length === 0) {
      throw new InvalidValueObjectException('Resource cannot be empty');
    }

    if (resource.length > 50) {
      throw new InvalidValueObjectException(
        'Resource name cannot exceed 50 characters',
      );
    }

    // Validar formato: solo letras, números, guiones y guiones bajos
    const resourceRegex = /^[a-zA-Z0-9_-]+$/;
    if (!resourceRegex.test(resource)) {
      throw new InvalidValueObjectException(
        'Resource name can only contain letters, numbers, hyphens and underscores',
      );
    }
  }

  private validateAction(action: Action): void {
    if (!action || !Object.values(Action).includes(action)) {
      throw new InvalidValueObjectException('Invalid action');
    }
  }

  getResource(): string {
    return this._resource;
  }

  getAction(): Action {
    return this._action;
  }

  equals(other: ResourceAction): boolean {
    return this._resource === other._resource && this._action === other._action;
  }

  toString(): string {
    return `${this._resource}:${this._action}`;
  }

  static create(resource: string, action: Action): ResourceAction {
    return new ResourceAction(resource, action);
  }

  static fromString(value: string): ResourceAction {
    const parts = value.split(':');
    if (parts.length !== 2) {
      throw new InvalidValueObjectException(
        'ResourceAction must be in format "resource:action"',
      );
    }

    const [resource, action] = parts;
    const actionEnum = Object.values(Action).find(
      (a) => a === (action as Action),
    );

    if (!actionEnum) {
      throw new InvalidValueObjectException(`Invalid action: ${action}`);
    }

    return new ResourceAction(resource, actionEnum);
  }
}
