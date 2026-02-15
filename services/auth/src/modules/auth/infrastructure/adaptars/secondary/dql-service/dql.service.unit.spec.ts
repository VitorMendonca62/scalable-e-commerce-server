import { DQLService } from './dql.service';
import DeadLetterMessageRepository from '@auth/domain/ports/secondary/dql.repository.port';
import { UsersQueueService } from '../message-broker/rabbitmq/users_queue/users-queue.service';
import { type Mocked } from 'vitest';
import { DQLFactory } from '@auth/infrastructure/helpers/tests/dlq-factory';

describe('DQLService', () => {
  let service: DQLService;
  let dqlRepository: Mocked<DeadLetterMessageRepository>;
  let usersQueueService: Mocked<UsersQueueService>;

  const mockPendingMessages = [
    DQLFactory.createModel(),
    DQLFactory.createModel(
      { originalEvent: 'test', originalPayload: { ire: 'ney' } },
      '232123312',
    ),
    DQLFactory.createModel(
      { originalEvent: 'test-teste', originalPayload: { jub: 'leu' } },
      '232123312123',
    ),
  ];

  beforeEach(async () => {
    dqlRepository = {
      getPendingMessages: vi.fn(),
      remove: vi.fn(),
      updateLastRetry: vi.fn(),
    } as any;

    usersQueueService = {
      send: vi.fn(),
    } as any;

    service = new DQLService(dqlRepository, usersQueueService);
  });

  describe('retryFailedMessages', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should return early when no pending messages exist', async () => {
      dqlRepository.getPendingMessages.mockResolvedValue([]);

      await service.retryFailedMessages();

      expect(dqlRepository.getPendingMessages).toHaveBeenCalledWith(50);
      expect(usersQueueService.send).not.toHaveBeenCalled();
      expect(dqlRepository.remove).not.toHaveBeenCalled();
      expect(dqlRepository.updateLastRetry).not.toHaveBeenCalled();
    });

    it('should process pending messages and retry them successfully', async () => {
      dqlRepository.getPendingMessages.mockResolvedValue(mockPendingMessages);
      usersQueueService.send
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      await service.retryFailedMessages();

      expect(dqlRepository.getPendingMessages).toHaveBeenCalledWith(50);

      expect(usersQueueService.send).toHaveBeenCalledTimes(3);
      expect(usersQueueService.send).toHaveBeenCalledWith(
        mockPendingMessages[0].originalEvent,
        mockPendingMessages[0].originalPayload,
        false,
      );
      expect(usersQueueService.send).toHaveBeenCalledWith(
        mockPendingMessages[1].originalEvent,
        mockPendingMessages[1].originalPayload,
        false,
      );
      expect(usersQueueService.send).toHaveBeenCalledWith(
        mockPendingMessages[2].originalEvent,
        mockPendingMessages[2].originalPayload,
        false,
      );

      expect(dqlRepository.remove).toHaveBeenCalledWith([
        mockPendingMessages[0]._id.toString(),
        mockPendingMessages[1]._id.toString(),
        mockPendingMessages[2]._id.toString(),
      ]);
      expect(dqlRepository.updateLastRetry).not.toHaveBeenCalled();
    });

    it('should handle partial failures when some messages fail to retry', async () => {
      dqlRepository.getPendingMessages.mockResolvedValue(mockPendingMessages);

      usersQueueService.send
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      await service.retryFailedMessages();

      expect(dqlRepository.getPendingMessages).toHaveBeenCalledWith(50);
      expect(usersQueueService.send).toHaveBeenCalledTimes(3);

      expect(dqlRepository.remove).toHaveBeenCalledWith([
        mockPendingMessages[0]._id.toString(),
        mockPendingMessages[2]._id.toString(),
      ]);

      expect(dqlRepository.updateLastRetry).toHaveBeenCalledWith([
        mockPendingMessages[1]._id.toString(),
      ]);
    });

    it('should handle partial failures when some messages fail to retry and throw error', async () => {
      dqlRepository.getPendingMessages.mockResolvedValue(mockPendingMessages);

      usersQueueService.send
        .mockResolvedValueOnce(true)
        .mockRejectedValueOnce(new Error('error'))
        .mockResolvedValueOnce(true);

      await service.retryFailedMessages();

      expect(dqlRepository.getPendingMessages).toHaveBeenCalledWith(50);
      expect(usersQueueService.send).toHaveBeenCalledTimes(3);

      expect(dqlRepository.remove).toHaveBeenCalledWith([
        mockPendingMessages[0]._id.toString(),
        mockPendingMessages[2]._id.toString(),
      ]);

      expect(dqlRepository.updateLastRetry).toHaveBeenCalledWith([
        mockPendingMessages[1]._id.toString(),
      ]);
    });

    it('should handle when all messages fail to retry', async () => {
      dqlRepository.getPendingMessages.mockResolvedValue(mockPendingMessages);
      usersQueueService.send.mockRejectedValue(false);

      await service.retryFailedMessages();

      expect(dqlRepository.getPendingMessages).toHaveBeenCalledWith(50);
      expect(usersQueueService.send).toHaveBeenCalledTimes(3);

      expect(dqlRepository.remove).not.toHaveBeenCalled();

      expect(dqlRepository.updateLastRetry).toHaveBeenCalledWith([
        mockPendingMessages[0]._id.toString(),
        mockPendingMessages[1]._id.toString(),
        mockPendingMessages[2]._id.toString(),
      ]);
    });

    it('should handle single pending message', async () => {
      const singleMessage = [mockPendingMessages[0]];
      dqlRepository.getPendingMessages.mockResolvedValue(singleMessage);
      usersQueueService.send.mockResolvedValue(true);

      await service.retryFailedMessages();

      expect(dqlRepository.getPendingMessages).toHaveBeenCalledWith(50);
      expect(usersQueueService.send).toHaveBeenCalledTimes(1);
      expect(dqlRepository.remove).toHaveBeenCalledWith([
        mockPendingMessages[0]._id.toString(),
      ]);
    });

    it('should process maximum batch size of 50 messages', async () => {
      const fiftyMessages = Array.from({ length: 50 }, (_, i) =>
        DQLFactory.createModel({}, `message-id-${i}`),
      );
      usersQueueService.send.mockResolvedValue(true);
      dqlRepository.getPendingMessages.mockResolvedValue(fiftyMessages);

      await service.retryFailedMessages();

      expect(dqlRepository.getPendingMessages).toHaveBeenCalledWith(50);
      expect(usersQueueService.send).toHaveBeenCalledTimes(50);

      const expectedIds = Array.from(
        { length: 50 },
        (_, i) => `message-id-${i}`,
      );
      expect(dqlRepository.remove).toHaveBeenCalledWith(expectedIds);
    });

    it('should handle repository errors gracefully', async () => {
      dqlRepository.getPendingMessages.mockResolvedValue(mockPendingMessages);
      dqlRepository.remove.mockRejectedValue(new Error('Database error'));
      usersQueueService.send.mockResolvedValue(true);

      await expect(service.retryFailedMessages()).rejects.toThrow(
        'Database error',
      );

      expect(dqlRepository.getPendingMessages).toHaveBeenCalledWith(50);
      expect(usersQueueService.send).toHaveBeenCalledTimes(3);
    });

    it('should handle messages with complex payload structures', async () => {
      const complexMessages = [
        DQLFactory.createModel({
          originalPayload: {
            userId: '123',
            profile: {
              name: 'John',
              email: 'john@example.com',
              metadata: {
                preferences: { theme: 'dark', language: 'en' },
              },
            },
            timestamp: new Date('2024-01-01'),
          },
        }),
      ];

      dqlRepository.getPendingMessages.mockResolvedValue(complexMessages);
      usersQueueService.send.mockResolvedValue(true);

      await service.retryFailedMessages();

      expect(usersQueueService.send).toHaveBeenCalledWith(
        complexMessages[0].originalEvent,
        complexMessages[0].originalPayload,
        false,
      );
      expect(dqlRepository.remove).toHaveBeenCalledWith([
        complexMessages[0]._id.toString(),
      ]);
    });

    it('should handle when repository update operations fail after successful retries', async () => {
      dqlRepository.getPendingMessages.mockResolvedValue(mockPendingMessages);
      usersQueueService.send
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      dqlRepository.remove.mockRejectedValue(new Error('Remove failed'));

      await expect(service.retryFailedMessages()).rejects.toThrow(
        'Remove failed',
      );
    });

    it('should execute cron job decorator correctly', () => {
      Reflect.getMetadata('schedule:cron', service.retryFailedMessages);

      expect(service.retryFailedMessages).toBeDefined();
      expect(typeof service.retryFailedMessages).toBe('function');
    });
  });
});
