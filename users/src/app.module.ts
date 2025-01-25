import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { MessagingModule } from '@modules/messaging/messaging.module';

@Module({
  imports: [UserModule, MessagingModule],
})
export class AppModule {}
