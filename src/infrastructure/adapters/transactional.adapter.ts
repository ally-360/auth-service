import { Injectable } from '@nestjs/common';
// import { DataSourceOptions, DataSource } from 'typeorm';
// import { addTransactionalDataSource } from 'typeorm-transactional';

export interface TransactionalBase {
  create: (size: number) => string;
}

@Injectable()
export class TypeormTransactionalAdapter {
  // public create(options: DataSourceOptions) {
  //   return addTransactionalDataSource(new DataSource(options));
  // }
}
