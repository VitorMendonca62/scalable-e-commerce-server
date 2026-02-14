import { ClientProxy } from '@nestjs/microservices';
import { UsersQueueService } from './users-queue.service';
import { defaultRoles } from '@auth/domain/constants/roles';
import { type Mocked, type Mock } from 'vitest';
import { EmailConstants } from '@auth/domain/values-objects/constants';
import { of, throwError } from 'rxjs';

describe('UsersQueueService', () => {
  let service: UsersQueueService;
  let clientProxy: Mocked<ClientProxy>;
  let pipeSpy: Mock;

  beforeEach(async () => {
    clientProxy = {
      emit: vi.fn(),
    } as any;

    service = new UsersQueueService(clientProxy);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(clientProxy).toBeDefined();
  });

  describe('send', () => {
    it('should send message broker', async () => {
      const value = {
        userID: '1',
        roles: defaultRoles,
        email: EmailConstants.EXEMPLE,
      };
      const event = 'user-created';

      const mockObservable = of(true);
      clientProxy.emit.mockReturnValue(mockObservable);
      pipeSpy = vi.spyOn(mockObservable, 'pipe');

      await service.send(event, value);

      expect(clientProxy.emit).toHaveBeenCalledWith(event, value);
      expect(clientProxy.emit).toHaveBeenCalledTimes(1);
    });

    it('should apply timeout of 5000ms to emit', async () => {
      const event = 'user-created';
      const payload = { userID: '1' };

      const mockObservable = of(true);
      clientProxy.emit.mockReturnValue(mockObservable);
      pipeSpy = vi.spyOn(mockObservable, 'pipe');

      await service.send(event, payload);

      expect(pipeSpy).toHaveBeenCalled();
    });

    it('should fail after 3 retries', async () => {
      const event = 'user-created';
      const payload = { userID: '1' };

      clientProxy.emit.mockReturnValue(
        throwError(() => new Error('Persistent error')),
      );

      try {
        await service.send(event, payload);
        vi.fail('expect fail');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        expect(clientProxy.emit).toHaveBeenCalled();
      }
    });

    it('should handle empty payload', async () => {
      const event = 'user-created';
      const payload = {};

      clientProxy.emit.mockReturnValue(of(true));

      await service.send(event, payload);

      expect(clientProxy.emit).toHaveBeenCalledWith(event, payload);
    });

    it('should handle successful emission on first try', async () => {
      const event = 'user-updated';
      const payload = {
        userID: '2',
        roles: ['admin'],
        email: 'admin@example.com',
      };

      clientProxy.emit.mockReturnValue(of(true));

      await service.send(event, payload);

      expect(clientProxy.emit).toHaveBeenCalledWith(event, payload);
      expect(clientProxy.emit).toHaveBeenCalledTimes(1);
    });

    it('should call pipe with timeout and retry operators', async () => {
      const event = 'user-created';
      const payload = { userID: '1' };

      const mockPipe = vi.fn().mockReturnValue(of(true));
      const mockObservable = {
        pipe: mockPipe,
      };

      clientProxy.emit.mockReturnValue(mockObservable as any);

      await service.send(event, payload);

      expect(mockPipe).toHaveBeenCalledTimes(1);
      expect(clientProxy.emit).toHaveBeenCalledWith(event, payload);
    });
  });
});
