import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(6, 55)
  oldPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(6, 55)
  newPassword: string;
}
