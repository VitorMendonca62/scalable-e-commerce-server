// Reference: https://github.com/ericlbarreto/post-ai/blob/main/apps/server/src/config/env.validation.ts

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
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv;

  @IsString()
  @IsNotEmpty()
  HOST: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  PORT: number;

  @IsString()
  @IsNotEmpty()
  MESSAGING_HOST: string;

  @IsString()
  @IsNotEmpty()
  MESSAGING_USER: string;

  @IsString()
  @IsNotEmpty()
  MESSAGING_PW: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  MESSAGING_PORT: number;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  API_TAG: string;

  @IsString()
  @IsNotEmpty()
  MONGO_DB_URL: string;
}
