import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CreateSessionUseCase } from './application/use-cases/create-session.usecase';
import { CreateUserUseCase } from './application/use-cases/create-user.usecase';
import { GetAccessTokenUseCase } from './application/use-cases/get-access-token';
import { TokenService } from './domain/ports/primary/session.port';
import { PubSubMessageBroker } from './domain/ports/secondary/pub-sub.port';
import { UserRepository } from './domain/ports/secondary/user-repository.port';
import { AuthController } from './infrastructure/adaptars/primary/http/auth.controller';
import { InMemoryUserRepository } from './infrastructure/adaptars/secondary/database/repositories/inmemory-user.repository';
import { RedisService } from './infrastructure/adaptars/secondary/message-broker/pub-sub/redis.service';
import { JwtTokenService } from './infrastructure/adaptars/secondary/token-service/jwt-token.service';
import { UserMapper } from './infrastructure/mappers/user.mapper';
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
