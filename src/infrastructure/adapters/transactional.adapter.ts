import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  addTransactionalDataSource,
  initializeTransactionalContext,
} from 'typeorm-transactional';

export interface TransactionalBase {
  create: (size: number) => string;
}

@Injectable()
export class TypeormTransactionalAdapter {
  public initialize() {
    return initializeTransactionalContext();
  }

  public create(dataSource: DataSource): DataSource {
    return addTransactionalDataSource(dataSource);
  }
}
