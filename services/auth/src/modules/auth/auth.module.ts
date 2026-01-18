import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CreateSessionUseCase } from './application/use-cases/create-session.usecase';
import { GetAccessTokenUseCase } from './application/use-cases/get-access-token.usecase';
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
import { MongooseUserRepository } from './infrastructure/adaptars/secondary/database/repositories/mongoose-user.repository';
import { UsersQueueService } from './infrastructure/adaptars/secondary/message-broker/rabbitmq/users_queue/users-queue.service';
import { TokenService } from './domain/ports/secondary/token-service.port';
import { JwtModule } from '@nestjs/jwt';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import BcryptPasswordHasher from './infrastructure/adaptars/secondary/password-hasher/bcrypt-password-hasher';
import { PasswordController } from './infrastructure/adaptars/primary/http/password.controller';
import { EmailSender } from './domain/ports/secondary/mail-sender.port';
import NodemailerEmailSender from './infrastructure/adaptars/secondary/email-sender/nodemailer.service';
import SendCodeForForgotPasswordUseCase from './application/use-cases/send-code-for-forgot-password.usecase';
import {
  EmailCodeModel,
  EmailCodeSchema,
} from './infrastructure/adaptars/secondary/database/models/email-code.model';
import EmailCodeRepository from './domain/ports/secondary/email-code-repository.port';
import MongooseEmailCodeRepository from './infrastructure/adaptars/secondary/database/repositories/mongoose-email-code.repository';
import ValidateCodeForForgotPasswordUseCase from './application/use-cases/validate-code-for-forgot-password.usecase';
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
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema },
      { name: EmailCodeModel.name, schema: EmailCodeSchema },
    ]),
    JwtModule.register({
      privateKey: fs.readFileSync(
        path.join(__dirname, '../../../certs/auth-private.pem'),
      ),
      signOptions: {
        algorithm: 'RS256',
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
  controllers: [AuthController, PasswordController, CertsController],
  providers: [
    CreateSessionUseCase,
    GetAccessTokenUseCase,
    FinishSessionUseCase,
    UserMapper,
    UsersQueueService,
    CookieService,
    SendCodeForForgotPasswordUseCase,
    ValidateCodeForForgotPasswordUseCase,
    ChangePasswordUseCase,
    GetCertsUseCase,
    GoogleStrategy,
    {
      provide: UserRepository,
      useClass: MongooseUserRepository,
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
  ],
})
export class AuthModule {}
