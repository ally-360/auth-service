import { ApiProperty } from '@nestjs/swagger';

export class PaginationDataResponseDto {
  @ApiProperty()
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
