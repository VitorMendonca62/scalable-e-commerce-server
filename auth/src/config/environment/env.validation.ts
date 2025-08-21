import {
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

  @IsString({ message: 'RABBITMQ_HOST must be a string.' })
  @IsNotEmpty({ message: 'RABBITMQ_HOST cannot be empty.' })
  RABBITMQ_HOST: string;

  @IsString({ message: 'RABBITMQ_DEFAULT_USER must be a string.' })
  @IsNotEmpty({ message: 'RABBITMQ_DEFAULT_USER cannot be empty.' })
  RABBITMQ_DEFAULT_USER: string;

  @IsString({ message: 'RABBITMQ_DEFAULT_PASS must be a string.' })
  @IsNotEmpty({ message: 'RABBITMQ_DEFAULT_PASS cannot be empty.' })
  RABBITMQ_DEFAULT_PASS: string;

  @IsNumber({}, { message: 'RABBITMQ_NODE_PORT must be a number.' })
  @Min(1, { message: 'RABBITMQ_NODE_PORT must be greater than or equal to 1.' })
  @Max(65535, {
    message: 'RABBITMQ_NODE_PORT must be less than or equal to 65535.',
  })
  RABBITMQ_NODE_PORT: number;

  @IsString({ message: 'JWT_SECRET must be a string.' })
  @IsNotEmpty({ message: 'JWT_SECRET cannot be empty.' })
  JWT_SECRET: string;

  @IsString({ message: 'API_TAG must be a string.' })
  @IsNotEmpty({ message: 'API_TAG cannot be empty.' })
  API_TAG: string;

  @IsString({ message: 'MONGO_INITDB_ROOT_USERNAME must be a string.' })
  @IsNotEmpty({ message: 'MONGO_INITDB_ROOT_USERNAME cannot be empty.' })
  MONGO_INITDB_ROOT_USERNAME: string;

  @IsString({ message: 'MONGO_INITDB_ROOT_PASSWORD must be a string.' })
  @IsNotEmpty({ message: 'MONGO_INITDB_ROOT_PASSWORD cannot be empty.' })
  MONGO_INITDB_ROOT_PASSWORD: string;

  @IsString({ message: 'MONGO_INITDB_DATABASE must be a string.' })
  @IsNotEmpty({ message: 'MONGO_INITDB_DATABASE cannot be empty.' })
  MONGO_INITDB_DATABASE: string;
}
