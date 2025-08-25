import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  lastname: string;

  @ApiProperty()
  dni: string;

  @ApiProperty()
  personalPhoneNumber: string;

  @ApiPropertyOptional({ nullable: true })
  photo?: string | null;
}
