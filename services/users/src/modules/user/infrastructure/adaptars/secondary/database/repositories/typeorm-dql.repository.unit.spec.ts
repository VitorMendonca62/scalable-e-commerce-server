import { Repository, In } from 'typeorm';
import { Mock } from 'vitest';
import DeadLetterMessageModel from '../models/dlq.model';
import { TypeOrmDQLRepository } from './typeorm-dql.repository';
import { DQLFactory } from '@user/infrastructure/helpers/dlq-factory';

describe('TypeOrmDQLRepository', () => {
  let repository: TypeOrmDQLRepository;
  let dqlRepository: Repository<DeadLetterMessageModel>;

  beforeEach(async () => {
    dqlRepository = {
      create: vi.fn(),
      save: vi.fn(),
      find: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    } as any;

    repository = new TypeOrmDQLRepository(dqlRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(dqlRepository).toBeDefined();
  });

  describe('save', () => {
    const event = 'event';
    const payload = { foo: 'bar' };

    it('should save message', async () => {
      const createdMessage = {
        originalEvent: event,
        originalPayload: payload,
        errorMessage: undefined,
      };

      (dqlRepository.create as Mock).mockReturnValue(createdMessage);
      (dqlRepository.save as Mock).mockResolvedValue(createdMessage);

      const response = await repository.save(event, payload);

      expect(response).toBeUndefined();
      expect(dqlRepository.create).toHaveBeenCalledWith({
        originalEvent: event,
        originalPayload: payload,
        errorMessage: undefined,
      });
      expect(dqlRepository.save).toHaveBeenCalledWith(createdMessage);
    });

    it('should save message with error', async () => {
      const error = new Error('error');
      const createdMessage = {
        originalEvent: event,
        originalPayload: payload,
        errorMessage: 'error',
      };

      (dqlRepository.create as Mock).mockReturnValue(createdMessage);
      (dqlRepository.save as Mock).mockResolvedValue(createdMessage);

      const response = await repository.save(event, payload, error);

      expect(response).toBeUndefined();
      expect(dqlRepository.create).toHaveBeenCalledWith({
        originalEvent: event,
        originalPayload: payload,
        errorMessage: 'error',
      });
      expect(dqlRepository.save).toHaveBeenCalledWith(createdMessage);
    });
  });

  describe('remove', () => {
    it('should call delete with correct parameters', async () => {
      const ids = [123, 1234, 12345];
      (dqlRepository.delete as Mock).mockResolvedValue({ affected: 3 });

      await repository.remove(ids);

      expect(dqlRepository.delete).toHaveBeenCalledWith({
        id: In(ids),
      });
    });
  });

  describe('update', () => {
    it('should call update with correct parameters', async () => {
      const ids = [1, 2];
      (dqlRepository.update as Mock).mockResolvedValue({ affected: 2 });

      await repository.updateLastRetry(ids);

      expect(dqlRepository.update).toHaveBeenCalledWith(
        { id: In(ids) },
        { lastRetryAt: expect.any(Date) },
      );
    });
  });

  describe('getPendingMessages', () => {
    const dqls = [
      DQLFactory.createModel(),
      DQLFactory.createModel({}, 121234242),
    ];

    it('should return dqls', async () => {
      (dqlRepository.find as Mock).mockResolvedValue(dqls);

      const response = await repository.getPendingMessages(50);

      expect(dqlRepository.find).toHaveBeenCalledWith({
        order: {
          failedAt: 'DESC',
        },
        take: 50,
      });
      expect(response).toEqual(dqls);
    });

    it('should return empty when not found messages', async () => {
      (dqlRepository.find as Mock).mockResolvedValue([]);

      const response = await repository.getPendingMessages(50);

      expect(dqlRepository.find).toHaveBeenCalledWith({
        order: {
          failedAt: 'DESC',
        },
        take: 50,
      });
      expect(response).toEqual([]);
    });
  });
});
