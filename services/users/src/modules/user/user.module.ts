import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserController } from './infrastructure/adaptars/primary/http/controllers/user.controller';
import { AddUserAddressUseCase } from './application/use-cases/address/add-user-address.usecase';
import { CreateUserUseCase } from './application/use-cases/user/create-user.usecase';
import { DeleteUserUseCase } from './application/use-cases/user/delete-user.usecase';
import { GetUserUseCase } from './application/use-cases/user/get-user.usecase';
import { UpdateUserUseCase } from './application/use-cases/user/update-user.usecase';
import { AddressMapper } from './infrastructure/mappers/address.mapper';
import { UserMapper } from './infrastructure/mappers/user.mapper';
import { GetUserAddressesUseCase } from './application/use-cases/address/get-user-addresses.usecase';
import { DeleteUserAddressUseCase } from './application/use-cases/address/delete-user-address.usecase';
import { AddressController } from './infrastructure/adaptars/primary/http/controllers/address.controller';
import { EmailSender } from './domain/ports/secondary/mail-sender.port';
import NodemailerEmailSender from './infrastructure/adaptars/secondary/email-sender/nodemailer.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import EmailCodeRepository from './domain/ports/secondary/email-code-repository.port';
import UserRepository from './domain/ports/secondary/user-repository.port';
import TypeOrmUserRepository from './infrastructure/adaptars/secondary/database/repositories/typeorm-user.repository';
import AddressRepository from './domain/ports/secondary/address-repository.port';
import TypeOrmAddressRepository from './infrastructure/adaptars/secondary/database/repositories/typeorm-address.repository';
import UserModel from './infrastructure/adaptars/secondary/database/models/user.model';
import AddressModel from './infrastructure/adaptars/secondary/database/models/address.model';
import { UsersQueueService } from './infrastructure/adaptars/secondary/message-broker/rabbitmq/users_queue/users-queue.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  EnvironmentVariables,
  NodeEnv,
} from '@config/environment/env.validation';
import { ValidateEmailUseCase } from './application/use-cases/user/validate-email-usecase';
import { TokenService } from './domain/ports/secondary/token-service.port';
import { JwtTokenService } from './infrastructure/adaptars/secondary/token-service/jwt-token.service';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs';
import * as path from 'path';
import { RedisEmailCodeRepository } from './infrastructure/adaptars/secondary/database/repositories/redis-email-code.repository';
import UserExternalController from './infrastructure/adaptars/primary/microservices/user.external.controller';
import BcryptPasswordHasher from './infrastructure/adaptars/secondary/password-hasher/bcrypt-password-hasher';
import { PasswordHasher } from './domain/ports/secondary/password-hasher.port';
import DeadLetterMessageModel from './infrastructure/adaptars/secondary/database/models/dlq.model';
import { DQLService } from './infrastructure/adaptars/secondary/dql-service/dql.service';
import { TypeOrmDQLRepository } from './infrastructure/adaptars/secondary/database/repositories/typeorm-dql.repository';
import DeadLetterMessageRepository from './domain/ports/secondary/dql.repository.port';
import QueueService from './infrastructure/adaptars/secondary/message-broker/queue.service';
@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([UserModel, AddressModel, DeadLetterMessageModel]),
    JwtModule.register({
      privateKey: fs.readFileSync(
        path.join(process.cwd(), 'certs/sign-up-private.pem'),
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

  controllers: [UserController, AddressController, UserExternalController],
  providers: [
    UserMapper,
    DQLService,
    AddressMapper,
    CreateUserUseCase,
    AddUserAddressUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    GetUserAddressesUseCase,
    DeleteUserAddressUseCase,
    ValidateEmailUseCase,
    QueueService,
    {
      provide: EmailSender,
      useClass: NodemailerEmailSender,
    },
    UsersQueueService,
    {
      provide: UserRepository,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: EmailCodeRepository,
      useClass: RedisEmailCodeRepository,
    },
    {
      provide: AddressRepository,
      useClass: TypeOrmAddressRepository,
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
      provide: DeadLetterMessageRepository,
      useClass: TypeOrmDQLRepository,
    },
  ],
})
export class UserModule {}
