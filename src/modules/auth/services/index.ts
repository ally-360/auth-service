import { LoginService } from './login.service';
import { RegisterService } from './register.service';
import { VerifyUserService } from './verify-user.service';
import { ReqResetPasswordService } from './req-reset-password.service';
import { ResetPasswordService } from './reset-password.service';
import { ChangePasswordService } from './change-password.service';

export const AuthServices = [
  LoginService,
  RegisterService,
  VerifyUserService,
  ReqResetPasswordService,
  ResetPasswordService,
  ChangePasswordService,
];
