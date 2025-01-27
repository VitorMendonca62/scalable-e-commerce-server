import { MessagingModule } from '@modules/messaging/messaging.module';
import { Module } from '@nestjs/common';
import { BooksModule } from './modules/books/books.module';

@Module({
  imports: [MessagingModule, BooksModule],
})
export class AppModule {}
