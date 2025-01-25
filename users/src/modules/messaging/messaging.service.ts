// reference: https://github.com/devjosecarlosteles/ms-notifications

import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class MessagingService {
  constructor(
    @Inject('MESSAGING_CLIENT') private client: ClientProxy,
    private config: ConfigService,
  ) {}

  async get<T>(channel: string, value: object, service = ''): Promise<T> {
    return await this.client
      .send({ cmd: this.getChannel(channel, service) }, value)
      .toPromise();
  }

  async set(key: string, value: any): Promise<any> {
    const setValue = await this.client.send('set', [key, value]).toPromise();
    return setValue;
  }

  async publish(channel: string, value: object, service = '') {
    if (this.config.get<string>('ENVIRONMENT') == 'production') {
      this.client.emit(this.getChannel(channel, service), value);
    }
  }

  private getChannel(channel: string, service: string): string {
    return (service ?? this.config.get('API_TAG')) + '-' + channel;
  }
}
