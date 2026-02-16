import { IDConstants } from '@auth/domain/values-objects/constants';
import { Model } from 'mongoose';
import { Mock } from 'vitest';
import { MongooseDQLRepository } from './mongoose-dql.repository';
import { DeadLetterMessageDocument } from '../models/dlq.model';
import { DQLFactory } from '@auth/infrastructure/helpers/tests/dlq-factory';

describe('MongooseDQLRepository', () => {
  let repository: MongooseDQLRepository;

  let DeadLetterMessageModel: Model<DeadLetterMessageDocument>;

  let mockedSavePrototype: Mock;
  let mockedExecDelete: Mock;

  beforeEach(async () => {
    DeadLetterMessageModel = vi.fn() as any;

    repository = new MongooseDQLRepository(DeadLetterMessageModel);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(DeadLetterMessageModel).toBeDefined();
  });

  describe('save', () => {
    const event = 'event';
    const payload = { foo: 'bar' };

    beforeEach(() => {
      mockedSavePrototype = vi.fn();
      DeadLetterMessageModel.prototype.save = mockedSavePrototype;
    });

    it('should save message', async () => {
      const response = await repository.save(event, payload);

      expect(response).toBeUndefined();
      expect(DeadLetterMessageModel).toHaveBeenCalledWith({
        originalEvent: event,
        originalPayload: payload,
        errorMessage: undefined,
      });
      expect(mockedSavePrototype).toHaveBeenCalled();
    });

    it('should save message with error', async () => {
      const error = new Error('error');
      const response = await repository.save(event, payload, error);

      expect(response).toBeUndefined();
      expect(DeadLetterMessageModel).toHaveBeenCalledWith({
        originalEvent: event,
        originalPayload: payload,
        errorMessage: 'error',
      });
      expect(mockedSavePrototype).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      mockedExecDelete = vi.fn();
      DeadLetterMessageModel.deleteMany = vi.fn().mockReturnValue({
        exec: mockedExecDelete,
      });
    });

    it('should call all functions with correct parameters and delete', async () => {
      const ids = ['123', '1234', '12345'];
      await repository.remove(ids);

      expect(DeadLetterMessageModel.deleteMany).toHaveBeenCalledWith({
        _id: { $in: ids },
      });
      expect(mockedExecDelete).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    let mockedExecUpdate: Mock;

    beforeEach(() => {
      mockedExecUpdate = vi.fn();
      DeadLetterMessageModel.updateMany = vi.fn().mockReturnValue({
        exec: mockedExecUpdate,
      });
    });

    it('should call all functions with correct parameters and update', async () => {
      await repository.updateLastRetry([
        IDConstants.EXEMPLE,
        `1${IDConstants.EXEMPLE}`,
      ]);

      expect(DeadLetterMessageModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: [IDConstants.EXEMPLE, `1${IDConstants.EXEMPLE}`] } },
        { lastRetryAt: new Date() },
      );
      expect(mockedExecUpdate).toHaveBeenCalled();
    });
  });

  describe('getPendingMessages', () => {
    const dqls = [
      DQLFactory.createModel(),
      DQLFactory.createModel({}, '12123424235423'),
    ];
    let mockSort: Mock;
    let mockLimit: Mock;
    let mockLean: Mock;
    let mockExec: Mock;

    beforeEach(() => {
      mockSort = vi.fn();
      mockLimit = vi.fn();
      mockSort.mockReturnValue({ limit: mockLimit });
      mockLean = vi.fn();
      mockLimit.mockReturnValue({ lean: mockLean });
      mockExec = vi.fn();
      mockLean.mockReturnValue({ exec: mockExec });
      mockExec.mockReturnValue(dqls);
      DeadLetterMessageModel.find = vi.fn().mockReturnValue({
        sort: mockSort,
      });
    });

    it('should return dqls', async () => {
      const response = await repository.getPendingMessages(50);

      expect(DeadLetterMessageModel.find).toHaveBeenCalledWith();
      expect(mockSort).toHaveBeenCalledWith({ failedAt: -1 });
      expect(mockLimit).toHaveBeenCalledWith(50);
      expect(mockLean).toHaveBeenCalled();
      expect(mockExec).toHaveBeenCalledWith();
      expect(response).toEqual(dqls);
    });

    it('should return empty when not found user', async () => {
      mockExec.mockReturnValue([]);

      const response = await repository.getPendingMessages(50);

      expect(response).toEqual([]);
    });
  });
});
