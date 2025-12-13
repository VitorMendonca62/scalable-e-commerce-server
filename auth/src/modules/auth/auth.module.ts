import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CreateSessionUseCase } from './application/use-cases/create-session.usecase';
import { GetAccessTokenUseCase } from './application/use-cases/get-access-token';
import { UserRepository } from './domain/ports/secondary/user-repository.port';
import { AuthController } from './infrastructure/adaptars/primary/http/auth.controller';
import { JwtTokenService } from './infrastructure/adaptars/secondary/token-service/jwt-token.service';
import { UserMapper } from './infrastructure/mappers/user.mapper';
import { EnvironmentVariables } from 'src/config/environment/env.validation';
import {
  UserModel,
  UserSchema,
} from './infrastructure/adaptars/secondary/database/models/user.model';

import { MongooseModule } from '@nestjs/mongoose';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { InMemoryUserRepository } from './infrastructure/adaptars/secondary/database/repositories/inmemory-user.repository';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MongooseUserRepository } from './infrastructure/adaptars/secondary/database/repositories/mongoose-user.repository';
import { UsersQueueService } from './infrastructure/adaptars/secondary/message-broker/rabbitmq/users_queue/users-queue.service';
import { IdInTokenPipe } from '@common/pipes/id-in-token.pipe';
import { TokenService } from './domain/ports/secondary/token-service.port';
import { JwtModule } from '@nestjs/jwt';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import BcryptPasswordHasher from './infrastructure/adaptars/secondary/password-hasher/bcrypt-password-hasher';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService<EnvironmentVariables>,
      ) => {
        return {
          secret: configService.get<string>('JWT_SECRET'),
        };
      },
    }),
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

          const uri = `amqp://${user}:${password}@${host}`;

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
    CreateSessionUseCase,
    GetAccessTokenUseCase,
    UserMapper,
    UsersQueueService,
    IdInTokenPipe,
    {
      provide: UserRepository,
      useClass: MongooseUserRepository,
    },
    {
      provide: TokenService,
      useClass: JwtTokenService,
    },
    {
      provide: PasswordHasher,
      useClass: BcryptPasswordHasher,
    },
  ],
})
export class AuthModule {}
