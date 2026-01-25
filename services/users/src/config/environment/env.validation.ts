import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(NodeEnv, {
    message:
      'NODE_ENV must be one of the following values: development, production, test.',
  })
  NODE_ENV: NodeEnv;

  @IsString({ message: 'HOST must be a string.' })
  @IsNotEmpty({ message: 'HOST cannot be empty.' })
  HOST: string;

  @IsNumber({}, { message: 'PORT must be a number.' })
  @Min(1, { message: 'PORT must be greater than or equal to 1.' })
  @Max(65535, { message: 'PORT must be less than or equal to 65535.' })
  PORT: number;

  @IsString({ message: 'RABBITMQ_DEFAULT_USER must be a string.' })
  @IsNotEmpty({ message: 'RABBITMQ_DEFAULT_USER cannot be empty.' })
  RABBITMQ_DEFAULT_USER: string;

  @IsString({ message: 'RABBITMQ_DEFAULT_PASS must be a string.' })
  @IsNotEmpty({ message: 'RABBITMQ_DEFAULT_PASS cannot be empty.' })
  RABBITMQ_DEFAULT_PASS: string;

  @IsString({ message: 'RABBITMQ_HOST must be a string.' })
  @IsNotEmpty({ message: 'RABBITMQ_HOST cannot be empty.' })
  RABBITMQ_HOST: string;

  @IsString({ message: 'SMTP_HOST must be a string.' })
  @IsNotEmpty({ message: 'SMTP_HOST cannot be empty.' })
  SMTP_HOST: string;

  @IsNumber({}, { message: 'SMTP_PORT must be a number.' })
  @Min(1, { message: 'SMTP_PORT must be greater than or equal to 1.' })
  @Max(65535, { message: 'SMTP_PORT must be less than or equal to 65535.' })
  @IsNotEmpty({ message: 'SMTP_PORT cannot be empty.' })
  SMTP_PORT: number;

  @IsString({ message: 'SMPT_USER_ID must be a string.' })
  @IsNotEmpty({ message: 'SMPT_USER_ID cannot be empty.' })
  SMPT_USER_ID: string;

  @IsString({ message: 'SMPT_USER_PASSWORD must be a string.' })
  @IsNotEmpty({ message: 'SMPT_USER_PASSWORD cannot be empty.' })
  SMPT_USER_PASSWORD: string;

  @IsString({ message: 'EMAIL_FROM_FOR_VALIDATE_EMAIL must be a string.' })
  @IsEmail({}, { message: 'EMAIL_FROM_FOR_VALIDATE_EMAIL must be a email.' })
  @IsNotEmpty({ message: 'EMAIL_FROM_FOR_VALIDATE_EMAIL cannot be empty.' })
  EMAIL_FROM_FOR_VALIDATE_EMAIL: string;

  @IsString({ message: 'COOKIE_SECRET must be a string.' })
  @IsNotEmpty({ message: 'COOKIE_SECRET cannot be empty.' })
  COOKIE_SECRET: string;

  @IsString({ message: 'SIGN_UP_KEYID must be a string.' })
  @IsNotEmpty({ message: 'SIGN_UP_KEYID cannot be empty.' })
  SIGN_UP_KEYID: string;

  @IsString({ message: 'POSTGRES_HOST must be a string.' })
  @IsNotEmpty({ message: 'POSTGRES_HOST cannot be empty.' })
  POSTGRES_HOST: string;

  @IsNumber({}, { message: 'POSTGRES_PORT must be a number.' })
  @Min(1, { message: 'POSTGRES_PORT must be greater than or equal to 1.' })
  @Max(65535, { message: 'POSTGRES_PORT must be less than or equal to 65535.' })
  @IsNotEmpty({ message: 'POSTGRES_PORT cannot be empty.' })
  POSTGRES_PORT: number;

  @IsString({ message: 'POSTGRES_USER must be a string.' })
  @IsNotEmpty({ message: 'POSTGRES_USER cannot be empty.' })
  POSTGRES_USER: string;

  @IsString({ message: 'POSTGRES_PASSWORD must be a string.' })
  @IsNotEmpty({ message: 'POSTGRES_PASSWORD cannot be empty.' })
  POSTGRES_PASSWORD: string;

  @IsString({ message: 'POSTGRES_DB must be a string.' })
  @IsNotEmpty({ message: 'POSTGRES_DB cannot be empty.' })
  POSTGRES_DB: string;

  @IsString({ message: 'REDIS_HOST must be a string.' })
  @IsNotEmpty({ message: 'REDIS_HOST cannot be empty.' })
  REDIS_HOST: string;

  @IsString({ message: 'REDIS_PASSWORD must be a string.' })
  @IsNotEmpty({ message: 'REDIS_PASSWORD cannot be empty.' })
  REDIS_PASSWORD: string;
}
