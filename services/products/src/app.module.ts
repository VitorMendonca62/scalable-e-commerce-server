import { validateENV } from '@config/environment/env.validate';
import { getCurrentNodeENV } from '@config/environment/utils';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { configNodeMailer } from '@config/smtp/nodemailer.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ProductModule } from '@product/product.module';
import ProductModel from '@product/infrastructure/adaptars/secondary/database/models/product.model';
import ProductFavoriteModel from '@product/infrastructure/adaptars/secondary/database/models/favorite.model';

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
    TypeOrmModule.forRootAsync({
      useFactory(configService: ConfigService<EnvironmentVariables>) {
        return {
          type: 'postgres',
          host: configService.get('POSTGRES_HOST'),
          port: configService.get('POSTGRES_PORT'),
          username: configService.get('POSTGRES_USER'),
          password: configService.get('POSTGRES_PASSWORD'),
          database: configService.get('POSTGRES_DB'),
          entities: [ProductModel, ProductFavoriteModel],
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    ProductModule,
  ],
  controllers: [],
})
export class AppModule {}
