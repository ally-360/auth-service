import { IsString, IsNotEmpty, Length, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Enable2FADto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'El ID del usuario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  userId: string;
}

export class Disable2FADto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'El ID del usuario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  userId: string;

  @ApiProperty({
    description: 'Código OTP para verificar la deshabilitación',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString({ message: 'El código OTP debe ser una cadena de texto' })
  @Length(6, 6, { message: 'El código OTP debe tener exactamente 6 dígitos' })
  otpCode: string;
}

export class Verify2FADto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'El ID del usuario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  userId: string;

  @ApiProperty({
    description: 'Código OTP para verificar',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString({ message: 'El código OTP debe ser una cadena de texto' })
  @Length(6, 6, { message: 'El código OTP debe tener exactamente 6 dígitos' })
  otpCode: string;
}

export class LoginWith2FADto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@example.com',
  })
  @IsString({ message: 'El email debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'MiContraseña123!',
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;

  @ApiProperty({
    description: 'Código OTP para verificar',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString({ message: 'El código OTP debe ser una cadena de texto' })
  @Length(6, 6, { message: 'El código OTP debe tener exactamente 6 dígitos' })
  otpCode: string;

  @ApiPropertyOptional({
    description: 'Dirección IP del cliente',
    example: '192.168.1.1',
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'User Agent del cliente',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
