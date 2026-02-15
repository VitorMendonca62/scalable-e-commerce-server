import DeadLetterMessageModel from '@auth/infrastructure/adaptars/secondary/database/models/dlq.model';

export default abstract class DeadLetterMessageRepository {
  abstract save(event: string, payload: object, error?: Error): Promise<void>;
  abstract getPendingMessages(limit: number): Promise<DeadLetterMessageModel[]>;
  abstract remove(ids: string[]): Promise<void>;
  abstract updateLastRetry(ids: string[]): Promise<void>;
}
