import { type Mocked } from 'vitest';

import { ClientProxy } from '@nestjs/microservices';
import { UsersQueueService } from './users-queue.service';
import DeadLetterMessageRepository from '@auth/domain/ports/secondary/dql.repository.port';
import CircuitBreaker from 'opossum';
import { of } from 'rxjs';

const mockCircuitBreakerConstructor = vi.fn();
const mockFireFunction = vi.fn();
const mockShutdownFunction = vi.fn();
const mockFallbackFunction = vi.fn();

type CircuitBreakerCallBack = (
  event: string,
  payload: object,
) => Promise<true | undefined>;

describe('UsersQueueService', () => {
  let service: UsersQueueService;

  let clientProxy: Mocked<ClientProxy>;
  let dlqRepository: DeadLetterMessageRepository;

  vi.mock('opossum', () => {
    return {
      default: class MockCircuitBreaker {
        constructor(
          action: CircuitBreakerCallBack,
          options: CircuitBreaker.Options,
        ) {
          mockCircuitBreakerConstructor(action, options);
        }
        fire = mockFireFunction;
        shutdown = mockShutdownFunction;
        fallback = mockFallbackFunction;
      },
    };
  });

  beforeEach(async () => {
    clientProxy = {
      emit: vi.fn(),
    } as any;

    dlqRepository = {
      save: vi.fn(),
    } as any;

    service = new UsersQueueService(clientProxy, dlqRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(clientProxy).toBeDefined();
    expect(dlqRepository).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should create circuit breaker with correct options', () => {
      service.onModuleInit();

      expect(mockCircuitBreakerConstructor).toHaveBeenCalledTimes(1);

      const [action, options] = mockCircuitBreakerConstructor.mock.calls[0];

      expect(action).toBeInstanceOf(Function);
      expect(options).toEqual({
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        rollingCountTimeout: 10000,
        rollingCountBuckets: 10,
        name: 'UsersBrokerCircuit',
      });
    });

    it('should configure fallback function', () => {
      service.onModuleInit();

      expect(mockFallbackFunction).toHaveBeenCalledTimes(1);
      expect(mockFallbackFunction).toHaveBeenCalledWith(expect.any(Function));
    });

    describe('circuit breaker action', () => {
      let circuitBreakerAction: CircuitBreakerCallBack;

      const event = 'user.created';
      const payload = { userId: '123', email: 'test@example.com' };

      beforeEach(() => {
        service.onModuleInit();
        circuitBreakerAction = mockCircuitBreakerConstructor.mock.calls[0][0];
      });

      it('should emit event successfully and return true', async () => {
        clientProxy.emit.mockReturnValue(of(undefined));

        const result = await circuitBreakerAction(event, payload);

        expect(clientProxy.emit).toHaveBeenCalledWith(event, payload);
        expect(result).toBe(true);
      });

      it('should retry 3 times on failure before throwing error', async () => {
        clientProxy.emit.mockImplementation(() => {
          throw new Error('Connection failed');
        });

        await expect(circuitBreakerAction(event, payload)).rejects.toThrow(
          'Connection failed',
        );
      }, 10000);

      it('should handle successful retry after initial failure', async () => {
        clientProxy.emit
          .mockImplementation(() => {
            throw new Error('First attempt failed');
          })
          .mockReturnValueOnce(of(undefined));

        const result = await circuitBreakerAction(event, payload);

        expect(result).toBe(true);
      });
    });

    describe('fallback function', () => {
      let fallbackFunction: (
        event: string,
        payload: object,
        isNewEvent: boolean,
      ) => Promise<void>;

      const event = 'user.created';
      const payload = { userId: '123' };

      beforeEach(() => {
        service.onModuleInit();
        fallbackFunction = mockFallbackFunction.mock.calls[0][0];

        (service as any).saveToDLQ = vi.fn().mockResolvedValue(undefined);
      });

      it('should save to DLQ when isNewEvent is true', async () => {
        const isNewEvent = true;

        await fallbackFunction(event, payload, isNewEvent);

        expect((service as any).saveToDLQ).toHaveBeenCalledWith(event, payload);
      });

      it('should NOT save to DLQ when isNewEvent is false', async () => {
        const isNewEvent = false;

        await fallbackFunction(event, payload, isNewEvent);

        expect((service as any).saveToDLQ).not.toHaveBeenCalled();
      });

      it('should handle saveToDLQ errors gracefully', async () => {
        const event = 'user.created';
        const payload = { userId: '123' };
        const isNewEvent = true;
        const dlqError = new Error('DLQ save failed');

        (service as any).saveToDLQ = vi.fn().mockRejectedValue(dlqError);

        await expect(
          fallbackFunction(event, payload, isNewEvent),
        ).rejects.toThrow('DLQ save failed');
      });
    });

    it('should initialize circuit breaker instance', () => {
      expect((service as any).circuitBreaker).toBeUndefined();

      service.onModuleInit();

      expect((service as any).circuitBreaker).toBeDefined();
    });
  });

  describe('onModuleDestroy', () => {
    beforeEach(() => {
      (service as any).circuitBreaker = new CircuitBreaker(vi.fn());
    });

    it('should call circuitBreaker.shutdown', async () => {
      service.onModuleDestroy();

      expect(mockShutdownFunction).toBeCalled();
    });
  });

  describe('send', () => {
    const event = 'event';
    const payload = { foo: 'bar' };

    beforeEach(() => {
      (service as any).circuitBreaker = new CircuitBreaker(vi.fn());
      mockFireFunction.mockReturnValue(true);
    });

    it('should call circuitBreaker.fire with correct parameters when isNewEvent is false', async () => {
      await service.send(event, payload, false);

      expect(mockFireFunction).toHaveBeenCalledWith(event, payload, false);
    });

    it('should call circuitBreaker.fire with correct parameters when isNewEvent is true', async () => {
      await service.send(event, payload, true);

      expect(mockFireFunction).toHaveBeenCalledWith(event, payload, true);
    });

    it('should call return true if  circuitBreaker.fire return true', async () => {
      mockFireFunction.mockReturnValue(true);

      const result = await service.send(event, payload, true);

      expect(result).toBe(true);
    });

    it('should call return false if  circuitBreaker.fire return undefined', async () => {
      mockFireFunction.mockReturnValue(undefined);

      const result = await service.send(event, payload, true);

      expect(result).toBe(false);
    });
  });

  describe('saveToDLQ', () => {
    it('should call dlqRepository.save with correct parameters', async () => {
      const error = new Error('Error');
      const payload = { foo: 'bar' };

      await (service as any).saveToDLQ('event', payload, error);

      expect(dlqRepository.save).toHaveBeenCalledWith('event', payload, error);
    });
  });
});
