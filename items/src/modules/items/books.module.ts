import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ItemController } from './adaptars/primary/http/item.controller';

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
  controllers: [ItemController],
})
export class ItemModule {}
