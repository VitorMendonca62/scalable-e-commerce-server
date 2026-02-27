import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CreateSessionUseCase } from './application/use-cases/create-session.usecase';
import { GetAccessTokenUseCase } from './application/use-cases/get-access-token.usecase';
import { UserRepository } from './domain/ports/secondary/user-repository.port';
import { AuthController } from './infrastructure/adaptars/primary/http/auth.controller';
import { JwtTokenService } from './infrastructure/adaptars/secondary/token-service/jwt-token.service';
import { UserMapper } from './infrastructure/mappers/user.mapper';
import {
  EnvironmentVariables,
  NodeEnv,
} from '../../config/environment/env.validation';
import {
  UserModel,
  UserSchema,
} from './infrastructure/adaptars/secondary/database/models/user.model';

import { MongooseModule } from '@nestjs/mongoose';
import { MongooseUserRepository } from './infrastructure/adaptars/secondary/database/repositories/mongoose-user.repository';
import { UsersQueueService } from './infrastructure/adaptars/secondary/message-broker/rabbitmq/users_queue/users-queue.service';
import { TokenService } from './domain/ports/secondary/token-service.port';
import { JwtModule } from '@nestjs/jwt';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import BcryptPasswordHasher from './infrastructure/adaptars/secondary/password-hasher/bcrypt-password-hasher';
import { PasswordController } from './infrastructure/adaptars/primary/http/password.controller';
import { EmailSender } from './domain/ports/secondary/mail-sender.port';
import NodemailerEmailSender from './infrastructure/adaptars/secondary/email-sender/nodemailer.service';
import {
  EmailCodeModel,
  EmailCodeSchema,
} from './infrastructure/adaptars/secondary/database/models/email-code.model';
import EmailCodeRepository from './domain/ports/secondary/email-code-repository.port';
import MongooseEmailCodeRepository from './infrastructure/adaptars/secondary/database/repositories/mongoose-email-code.repository';
import { ChangePasswordUseCase } from './application/use-cases/change-password.usecase';
import { TokenRepository } from './domain/ports/secondary/token-repository.port';
import { RedisTokenRepository } from './infrastructure/adaptars/secondary/database/repositories/redis-token.repository';
import { FinishSessionUseCase } from './application/use-cases/finish-session.usecase';
import CookieService from './infrastructure/adaptars/secondary/cookie-service/cookie.service';
import * as fs from 'fs';
import * as path from 'path';
import CertsController from './infrastructure/adaptars/primary/http/certs.controller';
import GetCertsUseCase from './application/use-cases/get-certs.usecase';
import { GoogleStrategy } from './infrastructure/adaptars/primary/http/strategies/google.strategy';
import ForgotPasswordUseCase from './application/use-cases/forgot-password.usecase';
import UserExternalController from './infrastructure/adaptars/primary/microservices/user.external.controller';
import DeadLetterMessageRepository from './domain/ports/secondary/dql.repository.port';
import { MongooseDQLRepository } from './infrastructure/adaptars/secondary/database/repositories/mongoose-dql.repository';
import DeadLetterMessageModel, {
  DeadLetterMessageSchema,
} from './infrastructure/adaptars/secondary/database/models/dlq.model';
import { DQLService } from './infrastructure/adaptars/secondary/dql-service/dql.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema },
      { name: EmailCodeModel.name, schema: EmailCodeSchema },
      { name: DeadLetterMessageModel.name, schema: DeadLetterMessageSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: async () => {
        const privateKey = await fs.promises.readFile(
          path.join(process.cwd(), 'certs/auth-private.pem'),
          'utf-8',
        );

        return {
          privateKey,
          signOptions: {
            algorithm: 'RS256',
          },
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
          return {
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
          };
        },
      },
    ]),
  ],
  controllers: [
    AuthController,
    PasswordController,
    CertsController,
    UserExternalController,
  ],
  providers: [
    CreateSessionUseCase,
    GetAccessTokenUseCase,
    FinishSessionUseCase,
    UserMapper,
    UsersQueueService,
    CookieService,
    ForgotPasswordUseCase,
    ChangePasswordUseCase,
    GetCertsUseCase,
    GoogleStrategy,
    DQLService,
    {
      provide: UserRepository,
      useClass: MongooseUserRepository,
    },
    {
      provide: DeadLetterMessageRepository,
      useClass: MongooseDQLRepository,
    },
    {
      provide: EmailCodeRepository,
      useClass: MongooseEmailCodeRepository,
    },
    {
      provide: TokenRepository,
      useClass: RedisTokenRepository,
    },
    {
      provide: TokenService,
      useClass: JwtTokenService,
    },
    {
      provide: PasswordHasher,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: EmailSender,
      useClass: NodemailerEmailSender,
    },
    {
      provide: 'RESET_PASS_PRIVATE_KEY',
      useFactory: async () => {
        return await fs.promises.readFile(
          path.join(process.cwd(), 'certs/reset-pass-private.pem'),
        );
      },
    },
  ],
})
export class AuthModule {}
