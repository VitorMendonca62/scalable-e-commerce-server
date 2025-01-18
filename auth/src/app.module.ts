import { UserMapper } from '@modules/auth/adaptars/mappers/user.mapper';
import { AuthController } from '@modules/auth/adaptars/primary/http/auth.controller';
import { CreateUserUseCase } from '@modules/auth/core/application/use-cases/create-user.usecase';
import { Module } from '@nestjs/common';

@Module({
  controllers: [AuthController],
  providers: [UserMapper, CreateUserUseCase],
})
export class AppModule {}
