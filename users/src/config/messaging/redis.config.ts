import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

export const addRedisClient = async (
  app: INestApplication,
  config: ConfigService,
) => {
  const logger = new Logger('RedisClient');
  const redisHost = config.get<string>('MESSAGING_HOST');
  const redisUser = config.get<string>('MESSAGING_USER');
  const redisPW = config.get<string>('MESSAGING_PW');
  const redisPort = config.get<number>('MESSAGING_PORT');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: redisHost,
      port: redisPort,
      username: redisUser,
      password: redisPW,
    },
  });

  await app
    .startAllMicroservices()
    .then(() => logger.debug('Redis client is listening'));
  return app;
};
