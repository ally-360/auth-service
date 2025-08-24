import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

const _logger = new Logger('GetUser - Decorator');

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest();

    if (!user) {
      _logger.error(`User request not found`);
      throw new InternalServerErrorException('User not found (request)');
    }

    _logger.debug(`User request found: ${JSON.stringify(user, null, 2)}`);
    return !data ? user : user[data];
  },
);
