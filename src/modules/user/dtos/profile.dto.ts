import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  lastname: string;

  @ApiProperty()
  @IsString()
  @Length(6, 13)
  dni: string;

  @ApiProperty()
  @IsPhoneNumber()
  personalPhoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  photo?: string;
}

export class UpdateProfileDto extends PartialType(CreateProfileDto) {}
