import { AuthModule } from '@modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [AuthModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [],
  providers: [],
})
export class AppModule {}
