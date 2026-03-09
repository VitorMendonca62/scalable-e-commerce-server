import DeadLetterMessageModel from '../adaptars/secondary/database/models/dlq.model';

export class DQLFactory {
  static createModel(
    overrides: Partial<DeadLetterMessageModel> = {},
    id: number = 1,
  ): DeadLetterMessageModel {
    return {
      id,
      originalEvent: 'event',
      originalPayload: { foo: 'bar' },
      errorMessage: 'error',
      failedAt: new Date(),
      lastRetryAt: new Date(),
      ...overrides,
    } as DeadLetterMessageModel;
  }
}
