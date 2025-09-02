import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { InMemoryUserRepository } from './infrastructure/adaptars/secondary/database/repositories/users/inmemory-user.repository';
import { UserRepository } from './domain/ports/secondary/user-repository.port';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from './infrastructure/adaptars/primary/http/controllers/user.controller';
import { AddUserAddressUseCase } from './application/use-cases/add-user-address.usecase';
import { CreateUserUseCase } from './application/use-cases/create-user.usecase';
import { DeleteUserUseCase } from './application/use-cases/delete-user.usecase';
import { GetUserUseCase } from './application/use-cases/get-user.usecase';
import { UpdateUserUseCase } from './application/use-cases/update-user.usecase';
import { UsersQueueService } from './infrastructure/adaptars/secondary/message-broker/rabbitmq/users_queue/users-queue.service';
import { AddressMapper } from './infrastructure/mappers/address.mapper';
import { UserMapper } from './infrastructure/mappers/user.mapper';
import { AddressService } from './infrastructure/adaptars/secondary/address/address.service';
import { AddressRepositoy } from './domain/ports/secondary/address-repository.port';
import InMemoryAddressRepository from './infrastructure/adaptars/secondary/database/repositories/inmemory-address.repository';
import { GetUserAddressUseCase } from './application/use-cases/get-user-addresses.usecase';
import { DeleteUserAddressUseCase } from './application/use-cases/delete-user-address.usecase';
import { AddressController } from './infrastructure/adaptars/primary/http/controllers/address.controller';

@Module({
  imports: [
    HttpModule,
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
    // ClientsModule.registerAsync([
    //   {
    //     name: 'USERS_BROKER_SERVICE',
    //     imports: [ConfigModule],
    //     inject: [ConfigService],
    //     useFactory: async (
    //       configService: ConfigService<EnvironmentVariables>,
    //     ) => {
    //       const user = configService.get<string>('RABBITMQ_DEFAULT_USER');
    //       const password = configService.get<string>('RABBITMQ_DEFAULT_PASS');
    //       const host = configService.get<string>('RABBITMQ_HOST');

    //       const uri = `amqp://${user}:${password}@${host}:5672`;

    //       return {
    //         transport: Transport.RMQ,
    //         options: {
    //           urls: [uri],
    //           queue: 'users_queue',
    //           queueOptions: {
    //             exclusive: false,
    //             autoDelete: false,
    //             arguments: null,
    //             durable: false,
    //           },
    //         },
    //       };
    //     },
    //   },
    // ]),
  ],
  controllers: [UserController, AddressController],
  providers: [
    // UsersQueueService,
    UserMapper,
    AddressMapper,
    CreateUserUseCase,
    AddUserAddressUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    AddressService,
    DeleteUserUseCase,
    GetUserAddressUseCase,
    DeleteUserAddressUseCase,
    {
      provide: UserRepository,
      useClass: InMemoryUserRepository,
    },
    {
      provide: AddressRepositoy,
      useClass: InMemoryAddressRepository,
    },
  ],
})
export class UserModule {}
