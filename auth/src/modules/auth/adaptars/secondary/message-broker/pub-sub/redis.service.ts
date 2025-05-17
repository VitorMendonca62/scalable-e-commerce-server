// reference: https://github.com/devjosecarlosteles/ms-notifications

import { PubSubMessageBroker } from '@modules/auth/core/domain/types/message-broker/pub-sub';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RedisService implements PubSubMessageBroker {
  constructor(
    @Inject('MESSAGING_CLIENT') private client: ClientProxy,
    private configService: ConfigService,
  ) {}

  async publish(channel: string, value: object, service = '') {
    if (this.configService.get<string>('ENVIRONMENT') == 'production') {
      this.client.emit(this.getChannel(channel, service), value);
    }
  }

  getChannel(channel: string, service: string): string {
    return (service ?? this.configService.get('API_TAG')) + '-' + channel;
  }
}
