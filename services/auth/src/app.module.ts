import { AuthModule } from '@auth/auth.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { getCurrentNodeENV } from '@config/environment/utils';
import { validateENV } from '@config/environment/env.validate';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { configMongoDB } from '@config/database/mongo.config';
import { configNodeMailer } from '@config/smtp/nodemailer.config';
import { configRedisdDB } from '@config/database/redis.config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [getCurrentNodeENV()],
      validate: validateENV,
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService<EnvironmentVariables>) => {
        return configMongoDB(configService);
      },
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService<EnvironmentVariables>) => {
        return configRedisdDB(configService);
      },
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService<EnvironmentVariables>) => {
        return configNodeMailer(configService);
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
  ],
  controllers: [],
})
export class AppModule {}
