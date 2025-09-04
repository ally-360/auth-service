import { User } from 'src/modules/auth/entities/user.entity';
import { UserResponseDto } from 'src/modules/auth/dtos/user-response.dto';
import { ProfileResponseDto } from 'src/modules/auth/dtos/profile-response.dto';

export function toUserResponseDto(user: User): UserResponseDto {
  const profile: ProfileResponseDto | null = user.profile
    ? {
        id: user.profile.id,
        name: user.profile.name,
        lastname: user.profile.lastname,
        dni: user.profile.dni,
        personalPhoneNumber: user.profile.personalPhoneNumber,
        photo: user.profile.photo ?? null,
      }
    : null;

  return {
    createdAt: user.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: user.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
    id: user.id,
    authId: user.authId,
    email: user.email,
    verified: user.verified,
    verifyToken: user.verifyToken ?? null,
    resetPasswordToken: user.resetPasswordToken ?? null,
    profile,
  };
}

export function toUserResponseDtoArray(users: User[]): UserResponseDto[] {
  return users.map(toUserResponseDto);
}
