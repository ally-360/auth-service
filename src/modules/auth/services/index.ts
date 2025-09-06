import { LoginService } from './login.service';
import { RegisterService } from './register.service';
import { VerifyUserService } from './verify-user.service';
import { RequestPasswordResetService } from './req-reset-password.service';
import { ResetPasswordService } from './reset-password.service';
import { ChangePasswordService } from './change-password.service';

// Nuevos servicios de dominio
import { AuthEnhancedService } from './auth.enhanced.service';
import { UserService } from './user.service';
import { OtpService } from './otp.service';
import { EmailService } from './email.service';
import { PasswordService } from './password.service';
import { RoleService } from './role.service';

export const AuthServices = [
  LoginService,
  RegisterService,
  VerifyUserService,
  RequestPasswordResetService,
  ResetPasswordService,
  ChangePasswordService,
];

export const DomainServices = [
  AuthEnhancedService,
  UserService,
  OtpService,
  EmailService,
  PasswordService,
  RoleService,
];

export const AllServices = [...AuthServices, ...DomainServices];
