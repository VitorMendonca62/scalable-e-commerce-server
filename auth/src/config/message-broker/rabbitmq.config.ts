import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { EnvironmentVariables } from '../environment/env.validation';

export const addRabbitMQClient = async (
  app: INestApplication,
  configService: ConfigService<EnvironmentVariables>,
) => {
  const logger = new Logger('RabbitMQ');
  const user = configService.get<string>('RABBITMQ_DEFAULT_USER');
  const password = configService.get<string>('RABBITMQ_DEFAULT_PASS');
  const host = configService.get<string>('RABBITMQ_HOST');

  const uri = `amqp://${user}:${password}@${host}:5672`;

  logger.debug(uri);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [uri],
      queueOptions: {
        exclusive: false,
        autoDelete: false,
        arguments: null,
        durable: false,
      },
    },
  });

  await app
    .startAllMicroservices()
    .then(() => logger.debug('Message broker client is listening'))
    .catch((error) => logger.error(error));
  return app;
};
