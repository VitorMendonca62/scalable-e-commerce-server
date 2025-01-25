import { Module } from '@nestjs/common';
import { UserController } from './adaptars/primary/http/controllers/user.controller';
import { UserMapper } from './adaptars/mappers/user.mapper';
import { CreateUserUseCase } from './core/application/use-cases/create-user.usecase';
import { DeleteUserUseCase } from './core/application/use-cases/delete-user.usecase';
import { GetUserUseCase } from './core/application/use-cases/get-user.usecase';
import { GetUsersUseCase } from './core/application/use-cases/get-users.usecase';
import { UpdateUserUseCase } from './core/application/use-cases/update-user.usecase';
import { MessagingModule } from '@modules/messaging/messaging.module';
import { UserRepository } from './core/application/ports/secondary/user-repository.interface';
import { InMemoryUserRepository } from './adaptars/secondary/database/repositories/inmemory-user.repository';
import UserExternalController from './adaptars/primary/microservices/user.external.controller';

@Module({
  imports: [MessagingModule],
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
