/**
 ** Constants messages for NotFoundException
 */
export const NFE = {
  /* Auth */
  NOT_RESET_TOKEN: 'Este usuario no tiene un proceso de cambio de contraseña.',
  /* User */
  NOT_USER: 'No se puede encontrar al usuario.',
  NOT_USER_UPDATE: 'No se encontro el usuario que intenta actualizar.',
  NOT_USER_BY: 'No se puede encontrar al usuario con el siguiente =>',
};

/**
 ** Constants messages for UnprocessableEntityException
 */
export const UEE = {
  ENTITY_PROCESS: 'Encontramos un error en la informacio proporcionada.',
  NOT_UPDATE_USER: 'Ocurrió un error mientras se actualizaba el usuario.',
};

/**
 ** Constants messages for UnauthorizedException
 */
export const UAE = {
  USER_UNVERIFY: 'Por favor, verifique su email.',
  UNAUTHORIZED: 1110 /* 'Verifica tus credenciales.' */,
};
/**
 ** Constants messages for BadRequestException
 */
export const BRE = {
  NOT_CURRENT_PASSWORD: 'La contraseña actual no coincide.',
};

/**
 ** Constants messages for ConflictException
 */
export const CFE = {
  NOT_SAVE_TOKEN: 'No se puede guardar el token de usuario.',
};

/**
 ** Constants messages for InternalServerErrorException
 */
export const ISE = {
  USER_NOT_CREATED: 'No se puede crear el usuario.',
};
