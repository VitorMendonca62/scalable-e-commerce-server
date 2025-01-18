import { Module } from '@nestjs/common';
import { AuthController } from './adaptars/primary/http/auth.controller';
import { CreateUserUseCase } from './core/application/use-cases/create-user.usecase';

@Module({
  controllers: [AuthController],
  providers: [CreateUserUseCase],
})
export class UserModule {}
