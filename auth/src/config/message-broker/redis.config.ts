import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { EnvironmentVariables } from '../environment/env.validation';

export const addRedisClient = async (
  app: INestApplication,
  configService: ConfigService<EnvironmentVariables>,
) => {
  const logger = new Logger('RedisClient');
  const redisHost = configService.get<string>('MESSAGING_HOST');
  const redisUser = configService.get<string>('MESSAGING_USER');
  const redisPW = configService.get<string>('MESSAGING_PW');
  const redisPort = configService.get<number>('MESSAGING_PORT');

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
    .then(() => logger.debug('Redis client is listening'))
    .catch((error) => logger.error(error));
  return app;
};
