import { Module } from '@nestjs/common';
import { AuthController } from './adaptars/primary/http/auth.controller';
import { CreateUserUseCase } from './core/application/use-cases/create-user.usecase';
import { UserRepository } from './core/application/ports/secondary/user-repository.interface';
import { InMemoryUserRepository } from './adaptars/secondary/database/repositories/inmemory-user.repository';

@Module({
  controllers: [AuthController],
  providers: [
    CreateUserUseCase,
    {
      provide: UserRepository,
      useClass: InMemoryUserRepository,
    },
  ],
})
export class UserModule {}
