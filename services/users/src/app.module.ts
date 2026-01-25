import { validateENV } from '@config/environment/env.validate';
import { getCurrentNodeENV } from '@config/environment/utils';
import { UserModule } from '@modules/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { configNodeMailer } from '@config/smtp/nodemailer.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserModel from '@modules/user/infrastructure/adaptars/secondary/database/models/user.model';
import AddressModel from '@modules/user/infrastructure/adaptars/secondary/database/models/address.model';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from '@nestjs-modules/ioredis';
import { configRedisdDB } from '@config/database/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [getCurrentNodeENV()],
      validate: validateENV,
    }),
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService<EnvironmentVariables>) => {
        return configNodeMailer(configService);
      },
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService<EnvironmentVariables>) => {
        return configRedisdDB(configService);
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      useFactory(configService: ConfigService<EnvironmentVariables>) {
        return {
          type: 'postgres',
          host: configService.get('POSTGRES_HOST'),
          port: configService.get('POSTGRES_PORT'),
          username: configService.get('POSTGRES_USER'),
          password: configService.get('POSTGRES_PASSWORD'),
          database: configService.get('POSTGRES_DB'),
          entities: [UserModel, AddressModel],
          synchronize: true,
          logging: true,
        };
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    UserModule,
  ],
  controllers: [],
})
export class AppModule {}
