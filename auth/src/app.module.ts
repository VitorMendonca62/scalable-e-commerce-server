import { AuthModule } from '@modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getCurrentNodeENV } from './config/environment/utils';
import { validate as validateENV } from './config/environment/env.validate';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [getCurrentNodeENV()],
      validate: validateENV,
    }),
    MongooseModule.forRoot(process.env.MONGO_DB_URL),
    AuthModule,
  ],
  controllers: [],
})
export class AppModule {}
