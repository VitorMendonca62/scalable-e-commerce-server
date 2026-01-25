import { MessageBrokerService } from '@user/domain/ports/secondary/message-broker.port';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class UsersQueueService implements MessageBrokerService {
  constructor(@Inject('USERS_BROKER_SERVICE') private client: ClientProxy) {}

  async send(event: string, payload: any) {
    this.client.emit(event, payload);
  }
}
