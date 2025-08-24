import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../../../common/constants/app/valid-roles.app';

export const META_ROLES = 'roles';

export const RoleProtected = (...args: ValidRoles[]) =>
  SetMetadata(META_ROLES, args);
