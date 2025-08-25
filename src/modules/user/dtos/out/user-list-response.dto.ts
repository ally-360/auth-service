import { ApiProperty } from '@nestjs/swagger';
import { PaginationDataResponseDto } from 'src/common/dtos/pagination-data-response.dto';
import { UserResponseDto } from 'src/modules/auth/dtos/user-response.dto';

export class UserListResponseDto extends PaginationDataResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  users: UserResponseDto[];
}
