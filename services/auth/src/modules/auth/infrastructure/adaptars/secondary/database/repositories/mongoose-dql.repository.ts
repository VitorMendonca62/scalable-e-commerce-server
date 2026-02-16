import { Injectable } from '@nestjs/common';
import DeadLetterMessageModel, {
  DeadLetterMessageDocument,
} from '../models/dlq.model';
import { Model } from 'mongoose';
import DeadLetterMessageRepository from '@auth/domain/ports/secondary/dql.repository.port';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class MongooseDQLRepository implements DeadLetterMessageRepository {
  constructor(
    @InjectModel(DeadLetterMessageModel.name)
    private DQLModel: Model<DeadLetterMessageDocument>,
  ) {}

  async save(event: string, payload: object, error?: Error): Promise<void> {
    const dqlModel = new this.DQLModel({
      originalEvent: event,
      originalPayload: payload,
      errorMessage: error?.message,
    });
    await dqlModel.save();
  }

  async getPendingMessages(limit: number): Promise<DeadLetterMessageModel[]> {
    return await this.DQLModel.find()
      .sort({
        failedAt: -1,
      })
      .limit(limit)
      .lean()
      .exec();
  }

  async remove(ids: string[]): Promise<void> {
    await this.DQLModel.deleteMany({ _id: { $in: ids } }).exec();
  }

  async updateLastRetry(ids: string[]): Promise<void> {
    await this.DQLModel.updateMany(
      { _id: { $in: ids } },
      { lastRetryAt: new Date() },
    ).exec();
  }
}
