import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

export { JwtAuthGuard } from './jwt-auth.guard';
export { RolesGuard } from './roles.guard';

export const Guards = [JwtAuthGuard, RolesGuard];
