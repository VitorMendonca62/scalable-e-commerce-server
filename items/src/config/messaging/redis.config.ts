import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProviderOptions,
  MicroserviceOptions,
  Transport,
} from '@nestjs/microservices';

export const messagingClientConfig = async (
  configService: ConfigService,
): Promise<ClientProviderOptions> =>
  ({
    transport: Transport.REDIS,
    options: {
      host: configService.get<string>('MESSAGING_HOST'),
      port: configService.get<number>('MESSAGING_PORT'),
      username: configService.get<string>('MESSAGING_USER'),
      password: configService.get<string>('MESSAGING_PW'),
    },
  }) as ClientProviderOptions;

export const addRedisClient = async (
  app: INestApplication,
  configService: ConfigService,
) => {
  const logger = new Logger('RedisClient');

  app.connectMicroservice<MicroserviceOptions>(
    await messagingClientConfig(configService),
  );

  await app
    .startAllMicroservices()
    .then(() => logger.debug('Redis client is listening'));
  return app;
};
