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
  @IsNotEmpty({ message: 'PORT cannot be empty.' })
  PORT: number;

  @IsString({ message: 'RABBITMQ_HOST must be a string.' })
  @IsNotEmpty({ message: 'RABBITMQ_HOST cannot be empty.' })
  RABBITMQ_HOST: string;

  @IsString({ message: 'RABBITMQ_DEFAULT_USER must be a string.' })
  @IsNotEmpty({ message: 'RABBITMQ_DEFAULT_USER cannot be empty.' })
  RABBITMQ_DEFAULT_USER: string;

  @IsString({ message: 'RABBITMQ_DEFAULT_PASS must be a string.' })
  @IsNotEmpty({ message: 'RABBITMQ_DEFAULT_PASS cannot be empty.' })
  RABBITMQ_DEFAULT_PASS: string;

  @IsString({ message: 'AUTH_JWT_KEYID must be a string.' })
  @IsNotEmpty({ message: 'AUTH_JWT_KEYID cannot be empty.' })
  AUTH_JWT_KEYID: string;

  @IsString({ message: 'RESET_PASS_KEYID must be a string.' })
  @IsNotEmpty({ message: 'RESET_PASS_KEYID cannot be empty.' })
  RESET_PASS_KEYID: string;

  @IsString({ message: 'MONGO_INITDB_ROOT_USERNAME must be a string.' })
  @IsNotEmpty({ message: 'MONGO_INITDB_ROOT_USERNAME cannot be empty.' })
  MONGO_INITDB_ROOT_USERNAME: string;

  @IsString({ message: 'MONGO_INITDB_ROOT_PASSWORD must be a string.' })
  @IsNotEmpty({ message: 'MONGO_INITDB_ROOT_PASSWORD cannot be empty.' })
  MONGO_INITDB_ROOT_PASSWORD: string;

  @IsString({ message: 'MONGO_DB_HOST must be a string.' })
  @IsNotEmpty({ message: 'MONGO_DB_HOST cannot be empty.' })
  MONGO_DB_HOST: string;

  @IsString({ message: 'MONGO_INITDB_DATABASE must be a string.' })
  @IsNotEmpty({ message: 'MONGO_INITDB_DATABASE cannot be empty.' })
  MONGO_INITDB_DATABASE: string;

  @IsString({ message: 'REDIS_HOST must be a string.' })
  @IsNotEmpty({ message: 'REDIS_HOST cannot be empty.' })
  REDIS_HOST: string;

  @IsString({ message: 'REDIS_PASSWORD must be a string.' })
  @IsNotEmpty({ message: 'REDIS_PASSWORD cannot be empty.' })
  REDIS_PASSWORD: string;

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

  @IsString({ message: 'EMAIL_FROM_FOR_FORGOT_PASSWORD must be a string.' })
  @IsEmail({}, { message: 'EMAIL_FROM_FOR_FORGOT_PASSWORD must be a email.' })
  @IsNotEmpty({ message: 'EMAIL_FROM_FOR_FORGOT_PASSWORD cannot be empty.' })
  EMAIL_FROM_FOR_FORGOT_PASSWORD: string;

  @IsString({ message: 'GOOGLE_CLIENT_SECRET must be a string.' })
  @IsNotEmpty({ message: 'GOOGLE_CLIENT_SECRET cannot be empty.' })
  GOOGLE_CLIENT_SECRET: string;

  @IsString({ message: 'GOOGLE_CLIENT_ID must be a string.' })
  @IsNotEmpty({ message: 'GOOGLE_CLIENT_ID cannot be empty.' })
  GOOGLE_CLIENT_ID: string;

  @IsString({ message: 'GOOGLE_CALLBACK_URL must be a string.' })
  @IsNotEmpty({ message: 'GOOGLE_CALLBACK_URL cannot be empty.' })
  GOOGLE_CALLBACK_URL: string;
}
