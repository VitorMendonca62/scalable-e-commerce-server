import { RedisService } from './redis.service';
import { ClientProxy } from '@nestjs/microservices';
import { defaultRoles } from '@modules/auth/domain/types/permissions';
import { PhoneNumberConstants } from '@modules/auth/domain/values-objects/phone-number/phone-number-constants';
import { ConfigService } from '@nestjs/config';
import { PubSubMessageBroker } from '@modules/auth/domain/ports/secondary/pub-sub.port';
import { EnvironmentVariables } from 'src/config/environment/env.validation';
import { EmailConstants } from '@modules/auth/domain/values-objects/email/email-constants';
import { NameConstants } from '@modules/auth/domain/values-objects/name/name-constants';
import { UsernameConstants } from '@modules/auth/domain/values-objects/username/username-constants';

describe('RedisService', () => {
  let service: PubSubMessageBroker;
  let clientProxy: jest.Mocked<ClientProxy>;
  let configService: ConfigService<EnvironmentVariables>;

  beforeEach(async () => {
    clientProxy = {
      emit: jest.fn(),
    } as any;

    configService = {
      get: jest.fn(),
    } as any;

    service = new RedisService(clientProxy, configService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(clientProxy).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('publish', () => {
    it('should publish in message broker', async () => {
      const serviceName = 'auth';
      const value = {
        _id: '1',
        roles: defaultRoles,
        email: EmailConstants.EXEMPLE,
        name: NameConstants.EXEMPLE,
        username: UsernameConstants.EXEMPLE,
        phonenumber: PhoneNumberConstants.EXEMPLE,
      };
      const channel = 'user-created';

      const expectedChannel = 'auth-user-created';

      service.publish(channel, value, serviceName);

      expect(clientProxy.emit).toHaveBeenCalledWith(expectedChannel, value);
      expect(clientProxy.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('getChannel', () => {
    it('should return channel with defined service', async () => {
      const channel = service.getChannel('user-created', 'auth');

      expect(channel).toBe('auth-user-created');
    });

    it('should return channel with undefined service', async () => {
      jest.spyOn(configService, 'get').mockReturnValue('auth');

      const channel = service.getChannel('user-created', null);

      expect(channel).toBe('auth-user-created');
      expect(configService.get).toHaveBeenCalledWith('API_TAG');
    });
  });
});
