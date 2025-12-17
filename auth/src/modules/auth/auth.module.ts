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
import { MongooseUserRepository } from './infrastructure/adaptars/secondary/database/repositories/mongoose-user.repository';
import { UsersQueueService } from './infrastructure/adaptars/secondary/message-broker/rabbitmq/users_queue/users-queue.service';
import { IdInTokenPipe } from '@common/pipes/id-in-token.pipe';
import { TokenService } from './domain/ports/secondary/token-service.port';
import { JwtModule } from '@nestjs/jwt';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import BcryptPasswordHasher from './infrastructure/adaptars/secondary/password-hasher/bcrypt-password-hasher';
import { ForgorPasswordController } from './infrastructure/adaptars/primary/http/forgot-password.controller';
import { EmailSender } from './domain/ports/secondary/mail-sender.port';
import NodemailerEmailSender from './infrastructure/adaptars/secondary/email-sender/nodemailer.service';
import SendCodeForForgotPasswordUseCase from './application/use-cases/send-code-for-forgot-password.usecase';
import {
  EmailCode,
  EmailCodeSchema,
} from './infrastructure/adaptars/secondary/database/models/code.model';
import CodeRepository from './domain/ports/secondary/code-repository.port';
import MongooseEmailCodeRepository from './infrastructure/adaptars/secondary/database/repositories/mongoose-code.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema },
      { name: EmailCode.name, schema: EmailCodeSchema },
    ]),
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
  controllers: [AuthController, ForgorPasswordController],
  providers: [
    CreateSessionUseCase,
    GetAccessTokenUseCase,
    UserMapper,
    UsersQueueService,
    IdInTokenPipe,
    SendCodeForForgotPasswordUseCase,
    {
      provide: UserRepository,
      useClass: MongooseUserRepository,
    },
    {
      provide: CodeRepository,
      useClass: MongooseEmailCodeRepository,
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
