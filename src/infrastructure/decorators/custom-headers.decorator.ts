import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export const CustomHeaders = createParamDecorator(
  (dtoClass: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const headers = request.headers;

    const dtoInstance = plainToInstance(dtoClass, headers);
    const errors = validateSync(dtoInstance, { whitelist: true });

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return dtoInstance;
  },
);
