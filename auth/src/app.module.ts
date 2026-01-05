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
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 15,
        },
      ],
    }),
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
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
