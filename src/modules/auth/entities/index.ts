import { User } from './user.entity';
import { Profile } from './profile.entity';
import { BaseEntity } from './base.entity';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { RefreshToken } from './refresh-token.entity';
import { Otp } from './otp.entity';
import { EmailVerification } from './email-verification.entity';
import { PasswordReset } from './password-reset.entity';

export { User } from './user.entity';
export { Profile } from './profile.entity';
export { BaseEntity } from './base.entity';
export { Role } from './role.entity';
export { Permission } from './permission.entity';
export { RefreshToken } from './refresh-token.entity';
export { Otp } from './otp.entity';
export { EmailVerification } from './email-verification.entity';
export { PasswordReset } from './password-reset.entity';

export const Entities = [
  User,
  Profile,
  BaseEntity,
  Role,
  Permission,
  RefreshToken,
  Otp,
  EmailVerification,
  PasswordReset,
];
