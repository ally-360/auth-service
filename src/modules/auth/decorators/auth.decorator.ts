import { UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RoleProtected } from './role-protected.decorator';
// import { UserRoleGuard } from '../guards/user-role.guard';
import { ValidRoles } from '../../../common/constants/app/valid-roles.app';

export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    ApiBearerAuth(),
    RoleProtected(...roles),
    UseGuards(AuthGuard() /* UserRoleGuard */),
  );
}
