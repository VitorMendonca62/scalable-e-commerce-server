import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import DeadLetterMessageModel from '../models/dlq.model';
import DeadLetterMessageRepository from '@user/domain/ports/secondary/dql.repository.port';

@Injectable()
export class TypeOrmDQLRepository implements DeadLetterMessageRepository {
  constructor(
    @InjectRepository(DeadLetterMessageModel)
    private dqlRepository: Repository<DeadLetterMessageModel>,
  ) {}

  async save(event: string, payload: object, error?: Error): Promise<void> {
    const dqlMessage = this.dqlRepository.create({
      originalEvent: event,
      originalPayload: payload,
      errorMessage: error?.message,
    });

    await this.dqlRepository.save(dqlMessage);
  }

  async getPendingMessages(limit: number): Promise<DeadLetterMessageModel[]> {
    return await this.dqlRepository.find({
      order: {
        failedAt: 'DESC',
      },
      take: limit,
    });
  }

  async remove(ids: number[]): Promise<void> {
    await this.dqlRepository.delete({
      id: In(ids),
    });
  }

  async updateLastRetry(ids: number[]): Promise<void> {
    await this.dqlRepository.update(
      {
        id: In(ids),
      },
      {
        lastRetryAt: new Date(),
      },
    );
  }
}
