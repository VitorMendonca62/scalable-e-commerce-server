import {
  EnvironmentVariables,
  NodeEnv,
} from '@config/environment/env.validation';
import { RedisSingleOptions } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';

export const configRedisdDB = (
  configService: ConfigService<EnvironmentVariables>,
): RedisSingleOptions => {
  const host = configService.get('REDIS_HOST');
  const password = configService.get('REDIS_PASSWORD');

  return {
    type: 'single' as const,
    options: {
      port: 6379,
      host,
      password,
      connectionName: 'auth-service',
      connectTimeout: 10000,
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        return Math.min(times * 50, 2000);
      },
      ...(configService.get('NODE_ENV') === NodeEnv.Production && {
        tls: {
          rejectUnauthorized: true,
        },
      }),
      enableReadyCheck: true,
      enableOfflineQueue: true,
    },
  };
};
