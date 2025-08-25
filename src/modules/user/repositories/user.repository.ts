import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from 'src/modules/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos';
import {
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  UserFiltersType,
  UserRelationsType,
} from 'src/modules/user/dtos/in/user-filters.dto';

export class UserRepository extends Repository<User> {
  private readonly _logger = new Logger(UserRepository.name);
  constructor(
    @InjectRepository(User) private readonly _repo: Repository<User>,
  ) {
    super(_repo.target, _repo.manager, _repo.queryRunner);
  }

  public async findByFilters(
    filters: UserFiltersType,
    pagination: PaginationDto,
    relations?: UserRelationsType,
  ): Promise<[User[], number]> {
    const { page, pageSize } = pagination;
    const findOptions = {
      skip: (page - 1) * pageSize,
      take: pageSize,
      cache: true,
    };
    const [users, total] = await this._repo.findAndCount({
      where: { ...filters, deletedAt: IsNull() },
      withDeleted: false,
      ...findOptions,
      relations: relations || {},
    });
    if (!users) {
      this._logger.error(
        `Users not found with filters ${JSON.stringify(filters)}`,
      );
      throw new NotFoundException('Users not found.');
    }
    return [users, total];
  }

  public async findOneByFilters(
    filters: UserFiltersType,
    relations?: UserRelationsType,
  ): Promise<User> {
    const user = await this._repo.findOne({
      where: { ...filters, deletedAt: IsNull() },
      relations: relations || {},
      withDeleted: false,
    });
    if (!user) {
      this._logger.error(
        `User not found with filters ${JSON.stringify(filters)}`,
      );
      throw new NotFoundException('User not found.');
    }
    return user;
  }

  // TODO: Response must be a boolean
  public async validateIfUserExist(filters: UserFiltersType): Promise<void> {
    const user = await this._repo.findOne({
      where: { ...filters, deletedAt: IsNull() },
      withDeleted: false,
    });
    if (user) throw new UnprocessableEntityException('User already exists.');
  }
}
