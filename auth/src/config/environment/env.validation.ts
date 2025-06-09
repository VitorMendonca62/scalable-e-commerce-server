import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
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

  @IsString({ message: 'MESSAGING_HOST must be a string.' })
  @IsNotEmpty({ message: 'MESSAGING_HOST cannot be empty.' })
  @IsUrl({}, { message: 'MESSAGING_HOST must be a valid URL.' })
  MESSAGING_HOST: string;

  @IsString({ message: 'MESSAGING_USER must be a string.' })
  @IsNotEmpty({ message: 'MESSAGING_USER cannot be empty.' })
  MESSAGING_USER: string;

  @IsString({ message: 'MESSAGING_PW must be a string.' })
  @IsNotEmpty({ message: 'MESSAGING_PW cannot be empty.' })
  MESSAGING_PW: string;

  @IsNumber({}, { message: 'MESSAGING_PORT must be a number.' })
  @Min(1, { message: 'MESSAGING_PORT must be greater than or equal to 1.' })
  @Max(65535, {
    message: 'MESSAGING_PORT must be less than or equal to 65535.',
  })
  MESSAGING_PORT: number;

  @IsString({ message: 'JWT_SECRET must be a string.' })
  @IsNotEmpty({ message: 'JWT_SECRET cannot be empty.' })
  JWT_SECRET: string;

  @IsString({ message: 'API_TAG must be a string.' })
  @IsNotEmpty({ message: 'API_TAG cannot be empty.' })
  API_TAG: string;

  @IsString({ message: 'MONGO_DB_URL must be a string.' })
  @IsNotEmpty({ message: 'MONGO_DB_URL cannot be empty.' })
  MONGO_DB_URL: string;
}
