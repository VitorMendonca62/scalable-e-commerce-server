import { Module } from '@nestjs/common';
import { UserController } from './adaptars/primary/http/user.controller';

@Module({
  controllers: [UserController]
})
export class UserModule {}
