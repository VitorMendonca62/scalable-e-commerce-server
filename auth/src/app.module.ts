import { AuthModule } from '@modules/auth/auth.module';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getCurrentNodeENV } from '@config/environment/utils';
import { validateENV } from '@config/environment/env.validate';
import { EnvironmentVariables } from '@config/environment/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [getCurrentNodeENV()],
      validate: validateENV,
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService<EnvironmentVariables>) => {
        return {
          uri: configService.get<string>('MONGO_DB_URL'),
          onConnectionCreate(connection) {
            connection
              .asPromise()
              .then(() =>
                new Logger('MongoDB').debug(
                  `MongoDB running in ${configService.get<string>('MONGO_DB_URL')}`,
                ),
              )
              .catch((error) => new Logger('MongoDB').error(error));

            return connection;
          },
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [],
})
export class AppModule {}
