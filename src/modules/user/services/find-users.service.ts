import { Inject, Logger } from '@nestjs/common';
import { PaginationDto } from 'src/common/dtos';
import { UserRepository } from 'src/modules/user/repositories/user.repository';
import { UserListResponseDto } from '../dtos/out/user-list-response.dto';

export class FindUsersService {
  private _logger = new Logger('FindUsersService');

  constructor(
    @Inject(UserRepository)
    private readonly _userRepo: UserRepository,
  ) {}

  async execute(pags: PaginationDto): Promise<UserListResponseDto> {
    const { pageSize, page } = pags;
    const [users, total] = await this._userRepo.findByFilters(
      {},
      { pageSize, page },
    );

    return {
      users,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}
