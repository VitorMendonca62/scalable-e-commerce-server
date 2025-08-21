import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CreateSessionUseCase } from './application/use-cases/create-session.usecase';
import { CreateUserUseCase } from './application/use-cases/create-user.usecase';
import { GetAccessTokenUseCase } from './application/use-cases/get-access-token';
import { TokenService } from './domain/ports/primary/session.port';
import { UserRepository } from './domain/ports/secondary/user-repository.port';
import { AuthController } from './infrastructure/adaptars/primary/http/auth.controller';
import { JwtTokenService } from './infrastructure/adaptars/secondary/token-service/jwt-token.service';
import { UserMapper } from './infrastructure/mappers/user.mapper';
import { EnvironmentVariables } from 'src/config/environment/env.validation';
import {
  UserEntity,
  UserSchema,
} from './infrastructure/adaptars/secondary/database/entities/user.entity';

import { MongooseModule } from '@nestjs/mongoose';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { InMemoryUserRepository } from './infrastructure/adaptars/secondary/database/repositories/inmemory-user.repository';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MongooseUserRepository } from './infrastructure/adaptars/secondary/database/repositories/mongoose-user.repository';
import { UsersQueueService } from './infrastructure/adaptars/secondary/message-broker/rabbitmq/users_queue/users-queue.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }]),
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
  controllers: [AuthController],
  providers: [
    CreateUserUseCase,
    CreateSessionUseCase,
    GetAccessTokenUseCase,
    UserMapper,
    UsersQueueService,
    {
      provide: UserRepository,
      useClass: MongooseUserRepository,
    },
    {
      provide: TokenService,
      useClass: JwtTokenService,
    },
  ],
})
export class AuthModule {}
