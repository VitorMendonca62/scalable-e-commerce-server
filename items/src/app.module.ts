import { Module } from '@nestjs/common';
import { ItemModule } from './modules/item/item.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ItemModule],
})
export class AppModule {}
