import DeadLetterMessageRepository from '@auth/domain/ports/secondary/dql.repository.port';
import { Injectable, Logger } from '@nestjs/common';
import { UsersQueueService } from '../message-broker/rabbitmq/users_queue/users-queue.service';
import pLimit from 'p-limit';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DQLService {
  private readonly logger = new Logger(DQLService.name);

  constructor(
    private readonly dqlRepository: DeadLetterMessageRepository,
    private readonly usersQueueService: UsersQueueService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryFailedMessages() {
    const startTime = Date.now();

    const pendingMessages = await this.dqlRepository.getPendingMessages(50);

    if (pendingMessages.length === 0) {
      return;
    }
    this.logger.log(`Processando ${pendingMessages.length} mensagens da DLQ`);

    const limit = pLimit(10);

    const results = await Promise.allSettled(
      pendingMessages.map((message) =>
        limit(() =>
          this.usersQueueService.send(
            message.originalEvent,
            message.originalPayload,
            false,
          ),
        ),
      ),
    );

    const successfulIDs: string[] = [];
    const unsuccessfulIDs: string[] = [];

    results.forEach((result, index) => {
      const messageId = pendingMessages[index]._id.toString();

      if (result.status === 'fulfilled' && result.value) {
        successfulIDs.push(messageId);
      } else {
        unsuccessfulIDs.push(messageId);
      }
    });

    await Promise.all([
      successfulIDs.length > 0
        ? this.dqlRepository.remove(successfulIDs)
        : Promise.resolve(),
      unsuccessfulIDs.length > 0
        ? this.dqlRepository.updateLastRetry(unsuccessfulIDs)
        : Promise.resolve(),
    ]);

    const duration = Date.now() - startTime;
    const stats = {
      successful: successfulIDs.length,
      failed: unsuccessfulIDs.length,
      total: pendingMessages.length,
    };

    this.logger.log(
      `DLQ retry concluído em ${duration}ms: ${JSON.stringify(stats)}`,
    );
  }
}
