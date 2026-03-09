import { Module } from '@nestjs/common';
import { EmailSender } from './domain/ports/secondary/mail-sender.port';
import NodemailerEmailSender from './infrastructure/adaptars/secondary/email-sender/nodemailer.service';

import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [TypeOrmModule.forFeature([])],

  controllers: [],
  providers: [
    {
      provide: EmailSender,
      useClass: NodemailerEmailSender,
    },
  ],
})
export class UserModule {}
