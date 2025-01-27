import { Module } from '@nestjs/common';
import { AuthController } from './adaptars/primary/http/auth.controller';
import { CreateUserUseCase } from './core/application/use-cases/create-user.usecase';
import { UserRepository } from './core/application/ports/secondary/user-repository.interface';
import { InMemoryUserRepository } from './adaptars/secondary/database/repositories/inmemory-user.repository';
import { JwtTokenService } from './core/application/services/jwt-token.service';
import { CreateSessionUseCase } from './core/application/use-cases/create-session.usecase';
import { UserMapper } from './core/application/mappers/user.mapper';
import { GetAccessTokenUseCase } from './core/application/use-cases/get-access-token';
import { MessagingModule } from '@modules/messaging/messaging.module';

@Module({
  imports: [MessagingModule],
  controllers: [AuthController],
  providers: [
    CreateUserUseCase,
    CreateSessionUseCase,
    GetAccessTokenUseCase,
    JwtTokenService,
    UserMapper,
    {
      provide: UserRepository,
      useClass: InMemoryUserRepository,
    },
  ],
})
export class AuthModule {}
