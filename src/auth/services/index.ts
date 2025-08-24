import { ChangePasswordService } from './change-password.service';
import { LoginService } from './login.service';
import { RegisterService } from './register.service';
import { ReqResetPasswordService } from './req-reset-password.service';
import { ResetPasswordService } from './reset-password.service';
import { VerifyUserService } from './verify-user.service';
import { SelectCompanyService } from './select-company.service';

export const AuthServices = [
  LoginService,
  RegisterService,
  VerifyUserService,
  ReqResetPasswordService,
  ResetPasswordService,
  ChangePasswordService,
  SelectCompanyService,
];
