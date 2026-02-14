import { MessageBroker } from '@auth/domain/ports/secondary/message-broker.port';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { retry, timeout } from 'rxjs';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UsersQueueService implements MessageBroker {
  constructor(@Inject('USERS_BROKER_SERVICE') private client: ClientProxy) {}

  async send(event: string, payload: object) {
    await lastValueFrom(
      this.client.emit(event, payload).pipe(timeout(5000), retry(3)),
    );
  }
}
