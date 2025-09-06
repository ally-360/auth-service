export interface Repository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
  delete(id: ID): Promise<void>;
}

export interface UserRepositoryInterface<T, ID> extends Repository<T, ID> {
  findByEmail(email: string): Promise<T | null>;
  findByAuthId(authId: string): Promise<T | null>;
  findActiveUsers(): Promise<T[]>;
  findUsersByRole(roleId: string): Promise<T[]>;
}

export interface TokenRepositoryInterface<T, ID> extends Repository<T, ID> {
  findByToken(token: string): Promise<T | null>;
  findByUserId(userId: string): Promise<T[]>;
  findActiveTokens(userId: string): Promise<T[]>;
  revokeAllUserTokens(userId: string): Promise<void>;
}

export interface VerificationRepositoryInterface<T, ID>
  extends Repository<T, ID> {
  findByEmail(email: string): Promise<T | null>;
  findByCode(code: string): Promise<T | null>;
  findActiveVerifications(email: string): Promise<T[]>;
  cleanupExpired(): Promise<number>;
}
