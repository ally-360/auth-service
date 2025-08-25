import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProfileResponseDto } from './profile-response.dto';

export class UserResponseDto {
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: string;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: string;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  deletedAt: string | null;

  @ApiProperty()
  id: number;

  @ApiProperty({ format: 'uuid' })
  authId: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  verified: boolean;

  @ApiPropertyOptional({ nullable: true })
  verifyToken?: string | null;

  @ApiPropertyOptional({ nullable: true })
  resetPasswordToken?: string | null;

  @ApiPropertyOptional({ type: () => ProfileResponseDto, nullable: true })
  profile?: ProfileResponseDto | null;
}
