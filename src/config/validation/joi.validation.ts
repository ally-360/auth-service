import * as Joi from 'joi';
import { truthy, falsy } from 'src/common/constants/app/bools.app';

export const JoiValidationSchema = Joi.object({
  NODE_ENV: Joi.required().valid('local', 'development', 'prod'),
  PORT: Joi.number().port().default(3000),

  DB_HOST: Joi.required(),
  DB_PORT: Joi.number().port().default(3306),
  DB_USERNAME: Joi.required(),
  DB_PASSWORD: Joi.required(),
  DB_DATABASE: Joi.required(),

  DB_SYNC: Joi.boolean()
    .truthy(...truthy)
    .falsy(...falsy)
    .when('NODE_ENV', {
      is: 'prod',
      then: Joi.boolean()
        .required()
        .truthy(...truthy)
        .falsy(...falsy)
        .default(false),
    }),

  STORAGE_IS_ENABLED: Joi.boolean()
    .required()
    .truthy(...truthy)
    .falsy(...falsy)
    .default(false),

  STORAGE_API_ENDPOINT: Joi.any().when('STORAGE_IS_ENABLED', {
    is: true,
    then: Joi.string().required(),
  }),

  STORAGE_USE_SSL: Joi.any().when('STORAGE_IS_ENABLED', {
    is: true,
    then: Joi.boolean()
      .required()
      .truthy(...truthy)
      .falsy(...falsy),
  }),

  STORAGE_BUCKET_NAME: Joi.any().when('STORAGE_IS_ENABLED', {
    is: true,
    then: Joi.string().required(),
  }),

  STORAGE_PORT: Joi.any().when('STORAGE_IS_ENABLED', {
    is: true,
    then: Joi.number().port().required(),
  }),

  STORAGE_ACCESS_KEY: Joi.any().when('STORAGE_IS_ENABLED', {
    is: true,
    then: Joi.string().required(),
  }),

  STORAGE_SECRET_KEY: Joi.any().when('STORAGE_IS_ENABLED', {
    is: true,
    then: Joi.string().required(),
  }),

  EMAIL_HOST: Joi.string().hostname().required().pattern(new RegExp('^smtp.')), // Asegurarse de que comience con 'smtp.'

  EMAIL_PORT: Joi.number().port().required().valid(587, 465), // Restringe a puertos comunes para SMTP

  EMAIL_SECURE: Joi.boolean()
    .required()
    .truthy(...truthy)
    .falsy(...falsy),

  EMAIL_USER: Joi.string().required(),
  EMAIL_PASSWORD: Joi.string().required(),

  EMAIL_FROM: Joi.string(),
});
