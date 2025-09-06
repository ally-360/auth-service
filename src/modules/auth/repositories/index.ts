import { UserRepository } from './user.repository';
import { RoleRepository } from './role.repository';
import { PermissionRepository } from './permission.repository';
import { RefreshTokenRepository } from './refresh-token.repository';
import { EmailVerificationRepository } from './email-verification.repository';
import { PasswordResetRepository } from './password-reset.repository';
import { OtpRepository } from './otp.repository';

export const AllRepositories = [
  UserRepository,
  RoleRepository,
  PermissionRepository,
  RefreshTokenRepository,
  EmailVerificationRepository,
  PasswordResetRepository,
  OtpRepository,
];

export const Repositories = AllRepositories;
