import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { InMemoryUserRepository } from './infrastructure/adaptars/secondary/database/repositories/inmemory-user.repository';
import { UserRepository } from './domain/ports/secondary/user-repository.port';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    ClientsModule.registerAsync([
      {
        name: 'USERS_BROKER_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (
          configService: ConfigService<EnvironmentVariables>,
        ) => {
          const user = configService.get<string>('RABBITMQ_DEFAULT_USER');
          const password = configService.get<string>('RABBITMQ_DEFAULT_PASS');
          const host = configService.get<string>('RABBITMQ_HOST');

          const uri = `amqp://${user}:${password}@${host}:5672`;

          return {
            transport: Transport.RMQ,
            options: {
              urls: [uri],
              queue: 'users_queue',
              queueOptions: {
                exclusive: false,
                autoDelete: false,
                arguments: null,
                durable: false,
              },
            },
          };
        },
      },
    ]),
  ],
  controllers: [],
  providers: [
    {
      provide: UserRepository,
      useClass: InMemoryUserRepository,
    },
  ],
})
export class UserModule {}
