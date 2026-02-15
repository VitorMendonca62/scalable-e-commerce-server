import DeadLetterMessageModel from '@auth/infrastructure/adaptars/secondary/database/models/dlq.model';

export class DQLFactory {
  static createModel(
    overrides: Partial<DeadLetterMessageModel> = {},
    id: string = '312231212',
  ): DeadLetterMessageModel {
    return {
      _id: { toString: () => id } as any,
      originalEvent: 'event',
      originalPayload: { foo: 'bar' },
      errorMessage: 'error',
      failedAt: new Date(),
      lastRetryAt: new Date(),
      ...overrides,
    } as DeadLetterMessageModel;
  }
}
