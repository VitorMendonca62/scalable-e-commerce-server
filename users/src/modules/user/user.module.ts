import { Module } from '@nestjs/common';
import { UserController } from './adaptars/primary/http/controllers/user.controller';
import { UserMapper } from './core/application/mappers/user.mapper';
import { CreateUserUseCase } from './core/application/use-cases/create-user.usecase';
import { DeleteUserUseCase } from './core/application/use-cases/delete-user.usecase';
import { GetUserUseCase } from './core/application/use-cases/get-user.usecase';
import { GetUsersUseCase } from './core/application/use-cases/get-users.usecase';
import { UpdateUserUseCase } from './core/application/use-cases/update-user.usecase';
import { UserRepository } from './core/application/ports/secondary/user-repository.interface';
import { InMemoryUserRepository } from './adaptars/secondary/database/repositories/inmemory-user.repository';
import UserExternalController from './adaptars/primary/microservices/user.external.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'MESSAGING_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => {
          const redisHost = configService.get<string>('MESSAGING_HOST');
          const redisUser = configService.get<string>('MESSAGING_USER');
          const redisPW = configService.get<string>('MESSAGING_PW');
          const redisPort = configService.get<number>('MESSAGING_PORT');

          return {
            transport: Transport.REDIS,
            options: {
              host: redisHost,
              port: redisPort,
              username: redisUser,
              password: redisPW,
            },
          };
        },
      },
    ]),
  ],
  controllers: [UserController, UserExternalController],
  providers: [
    UserMapper,
    CreateUserUseCase,
    GetUserUseCase,
    GetUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    {
      provide: UserRepository,
      useClass: InMemoryUserRepository,
    },
  ],
})
export class UserModule {}
