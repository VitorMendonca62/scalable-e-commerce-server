import { EnvironmentVariables } from '@config/environment/env.validation';
import { RedisSingleOptions } from '@nestjs-modules/ioredis';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const configRedisdDB = (
  configService: ConfigService<EnvironmentVariables>,
): RedisSingleOptions => {
  const logger = new Logger('REDIS');
  const host = configService.get('REDIS_HOST');
  const password = configService.get('REDIS_PASSWORD');
  const uri = `redis://:${password}@${host}`;
  logger.debug(`Redis running in ${uri}`);

  return {
    type: 'single' as const,
    url: uri,
  };
};
