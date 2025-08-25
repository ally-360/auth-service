import { applyDecorators } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

export function MakeTransactional() {
  return applyDecorators(Transactional());
}
