import { Module } from '@nestjs/common';
import { ItemsModule } from './modules/items/items.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ItemsModule],
})
export class AppModule {}
