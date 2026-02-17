import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { retry, timeout, map } from 'rxjs/operators';
import CircuitBreaker from 'opossum';
import { MessageBroker } from '@auth/domain/ports/secondary/message-broker.port';
import DeadLetterMessageRepository from '@auth/domain/ports/secondary/dql.repository.port';

@Injectable()
export class UsersQueueService implements MessageBroker, OnModuleInit {
  private circuitBreaker: CircuitBreaker;
  private readonly logger = new Logger(UsersQueueService.name);

  constructor(
    @Inject('USERS_BROKER_SERVICE') private client: ClientProxy,
    private readonly dlqRepository: DeadLetterMessageRepository,
  ) {
    client.connect();
  }

  onModuleInit() {
    const options: CircuitBreaker.Options = {
      timeout: 5000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
      rollingCountTimeout: 10000,
      rollingCountBuckets: 10,
      name: 'UsersBrokerCircuit',
    };

    this.circuitBreaker = new CircuitBreaker(
      async (event: string, payload: object) => {
        return lastValueFrom(
          this.client.emit(event, payload).pipe(
            timeout(3000),
            retry({ count: 3, delay: 1000 }),
            map(() => true),
          ),
        );
      },
      options,
    );

    this.circuitBreaker.fallback(
      async (event: string, payload: object, isNewEvent: boolean) => {
        this.logger.error(`Falha ao enviar evento: ${event}`);

        if (isNewEvent) {
          this.logger.error(`Fallback acionado - Salvando na DLQ: ${event}`);
          await this.saveToDLQ(event, payload);
        }
      },
    );
  }

  onModuleDestroy() {
    this.circuitBreaker.shutdown();
  }

  async send(
    event: string,
    payload: object,
    isNewEvent: boolean,
  ): Promise<boolean> {
    this.logger.debug(`Enviando evento: ${event}`);

    return (
      (await this.circuitBreaker.fire(event, payload, isNewEvent)) !== undefined
    );
  }

  private async saveToDLQ(
    event: string,
    payload: object,
    originalError?: Error,
  ) {
    await this.dlqRepository.save(event, payload, originalError);
  }
}
