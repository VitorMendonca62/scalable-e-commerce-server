import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './adaptars/primary/http/auth.controller';
import { InMemoryUserRepository } from './adaptars/secondary/database/repositories/inmemory-user.repository';
import { UserRepository } from './core/application/ports/secondary/user-repository.interface';
import { CreateSessionUseCase } from './core/application/use-cases/create-session.usecase';
import { CreateUserUseCase } from './core/application/use-cases/create-user.usecase';
import { GetAccessTokenUseCase } from './core/application/use-cases/get-access-token';
import { TokenService } from './core/application/ports/primary/session.port';
import { JwtTokenService } from './adaptars/secondary/token-service/jwt-token.service';
import { UserMapper } from './core/application/mappers/user.mapper';
import { PubSubMessageBroker } from './core/domain/types/message-broker/pub-sub';
import { RedisService } from './adaptars/secondary/message-broker/pub-sub/redis.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'MESSAGING_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => {
          const redisHost = configService.get<string>('MESSAGING_HOST');
          const redisUser = configService.get<string>('MESSAGING_USER');
          const redisPW = configService.get<string>('MESSAGING_PW');
          const redisPort = configService.get<number>('MESSAGING_PORT');

          return {
            transport: Transport.REDIS,
            options: {
              host: redisHost,
              port: redisPort,
              username: redisUser,
              password: redisPW,
            },
          };
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    CreateUserUseCase,
    CreateSessionUseCase,
    GetAccessTokenUseCase,
    UserMapper,
    {
      provide: UserRepository,
      useClass: InMemoryUserRepository,
    },
    {
      provide: PubSubMessageBroker,
      useClass: RedisService,
    },
    {
      provide: TokenService,
      useClass: JwtTokenService,
    },
  ],
})
export class AuthModule {}
