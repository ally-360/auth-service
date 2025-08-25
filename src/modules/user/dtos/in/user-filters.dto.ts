import { FindOptionsRelations, FindOptionsWhere } from 'typeorm';
import { User } from 'src/modules/auth/entities/user.entity';

export type UserFiltersType = FindOptionsWhere<User>;
export type UserRelationsType = FindOptionsRelations<User>;
