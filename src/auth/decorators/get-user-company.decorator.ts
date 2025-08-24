import {
  createParamDecorator,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

const _logger = new Logger('GetUserCompany - Decorator');

export const GetUserCompany = createParamDecorator(
  (_data, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest();

    if (!user.id) {
      _logger.error(`Invalid token`, { user });
      throw new UnauthorizedException();
    }

    _logger.debug(`User request found: ${JSON.stringify(user)}`);
    // TODO: Revisar tipo de dato de company (probablemente selectedCompanyId)
    return user.company as any;
  },
);
