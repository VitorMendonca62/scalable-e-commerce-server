import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from 'src/app.module';

export const addRedisClient = async (config: ConfigService) => {
  const logger = new Logger('RedisClient');
  const redisHost = config.get<string>('MESSAGING_HOST');
  const redisUser = config.get<string>('MESSAGING_USER');
  const redisPW = config.get<string>('MESSAGING_PW');
  const redisPort = config.get<number>('MESSAGING_PORT');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.REDIS,
      options: {
        host: redisHost,
        port: redisPort,
        username: redisUser,
        password: redisPW,
      },
    },
  );

  await app.listen().then(() => logger.debug('Redis client is listening'));
};
