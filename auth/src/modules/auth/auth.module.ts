import { Module } from '@nestjs/common';
import { AuthController } from './adaptars/primary/http/auth.controller';
import { CreateUserUseCase } from './core/application/use-cases/create-user.usecase';
import { UserRepository } from './core/application/ports/secondary/user-repository.interface';
import { InMemoryUserRepository } from './adaptars/secondary/database/repositories/inmemory-user.repository';
import { JwtTokenService } from './core/application/services/jwt-token.service';
import { CreateSessionUseCase } from './core/application/use-cases/create-session.usecase';
import { UserMapper } from './adaptars/mappers/user.mapper';

@Module({
  controllers: [AuthController],
  providers: [
    CreateUserUseCase,
    CreateSessionUseCase,
    UserMapper,
    {
      provide: UserRepository,
      useClass: InMemoryUserRepository,
    },
    JwtTokenService,
  ],
})
export class AuthModule {}
