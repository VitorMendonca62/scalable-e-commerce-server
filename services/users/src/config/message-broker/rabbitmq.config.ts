import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { EnvironmentVariables, NodeEnv } from '../environment/env.validation';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

export const addRabbitMQClient = async (
  app: NestFastifyApplication,
  configService: ConfigService<EnvironmentVariables>,
) => {
  const logger = new Logger('RabbitMQ');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        {
          protocol: 'amqp',
          hostname: configService.get('RABBITMQ_HOST'),
          port: 5672,
          username: configService.get('RABBITMQ_DEFAULT_USER'),
          password: configService.get('RABBITMQ_DEFAULT_PASS'),
        },
      ],
      queue: 'users_queue',
      queueOptions: {
        exclusive: false,
        autoDelete: false,
        arguments: null,
        noAck: false,
        durable: configService.get('NODE_ENV') === NodeEnv.Production,
      },
    },
  });

  await app.startAllMicroservices().catch((error) => logger.error(error));
};
