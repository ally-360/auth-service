import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ActivateUserDto {
  @ApiProperty({ description: 'Activation Token' })
  @IsNotEmpty()
  code: string;
}
