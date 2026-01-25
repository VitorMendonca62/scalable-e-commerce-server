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
import CookieService from './infrastructure/adaptars/primary/http/services/cookie/cookie.service';
import { UsersQueueService } from './infrastructure/adaptars/secondary/message-broker/rabbitmq/users_queue/users-queue.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { ValidateEmailUseCase } from './application/use-cases/user/validate-email-usecase';
import { TokenService } from './domain/ports/secondary/token-service.port';
import { JwtTokenService } from './infrastructure/adaptars/secondary/token-service/jwt-token.service';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs';
import * as path from 'path';
import { RedisEmailCodeRepository } from './infrastructure/adaptars/secondary/database/repositories/redis-email-code.repository';
import UserExternalController from './infrastructure/adaptars/primary/microservices/user.external.controller';
@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([UserModel, AddressModel]),
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

  controllers: [UserController, AddressController, UserExternalController],
  providers: [
    UserMapper,
    CookieService,
    AddressMapper,
    CreateUserUseCase,
    AddUserAddressUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    GetUserAddressesUseCase,
    DeleteUserAddressUseCase,
    ValidateEmailUseCase,
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
  ],
})
export class UserModule {}
