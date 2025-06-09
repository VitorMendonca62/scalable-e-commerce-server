// reference: https://github.com/devjosecarlosteles/ms-notifications

import { PubSubMessageBroker } from '@modules/auth/domain/ports/secondary/pub-sub.port';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { EnvironmentVariables } from 'src/config/environment/env.validation';

@Injectable()
export class RedisService implements PubSubMessageBroker {
  constructor(
    @Inject('MESSAGING_CLIENT') private client: ClientProxy,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}

  async publish(channel: string, value: object, service: string | undefined) {
    this.client.emit(this.getChannel(channel, service), value);
  }

  getChannel(channel: string, service: string | null): string {
    return (
      (service ?? this.configService.get<string>('API_TAG')) + '-' + channel
    );
  }
}
