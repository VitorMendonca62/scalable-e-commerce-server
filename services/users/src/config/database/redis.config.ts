import { EnvironmentVariables } from '@config/environment/env.validation';
import { RedisSingleOptions } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';

export const configRedisdDB = (
  configService: ConfigService<EnvironmentVariables>,
): RedisSingleOptions => {
  const host = configService.get('REDIS_HOST');
  const password = configService.get('REDIS_PASSWORD');
  const uri = `redis://:${password}@${host}`;

  return {
    type: 'single' as const,
    url: uri,
  };
};
