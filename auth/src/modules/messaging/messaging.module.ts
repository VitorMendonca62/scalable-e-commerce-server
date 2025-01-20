import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MessagingService } from './messaging.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
