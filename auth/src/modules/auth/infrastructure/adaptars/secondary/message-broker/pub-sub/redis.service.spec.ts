import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { ClientProxy } from '@nestjs/microservices';
import { defaultRoles } from '@modules/auth/domain/types/permissions';
import { PhoneNumberConstants } from '@modules/auth/domain/values-objects/phone-number/PhoneNumberConstants';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { PubSubMessageBroker } from '@modules/auth/domain/ports/secondary/pub-sub.port';
import { EnvironmentVariables } from 'src/config/environment/env.validation';
import { EmailConstants } from '@modules/auth/domain/values-objects/email/EmailConstants';
import { NameConstants } from '@modules/auth/domain/values-objects/name/NameConstants';
import { UsernameConstants } from '@modules/auth/domain/values-objects/username/UsernameConstants';

describe('RedisService', () => {
  let service: PubSubMessageBroker;
  let clientProxyMock: jest.Mocked<ClientProxy>;
  let configService: ConfigService<EnvironmentVariables>;

  beforeEach(async () => {
    clientProxyMock = {
      emit: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        {
          provide: 'MESSAGING_CLIENT',
          useValue: clientProxyMock,
        },
        {
          provide: PubSubMessageBroker,
          useClass: RedisService,
        },
        ConfigService,
      ],
    }).compile();

    service = module.get<PubSubMessageBroker>(PubSubMessageBroker);
    configService =
      module.get<ConfigService<EnvironmentVariables>>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      expect(clientProxyMock.emit).toHaveBeenCalledWith(expectedChannel, value);
      expect(clientProxyMock.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('getChannel', () => {
    it('should return channel with defined service', async () => {
      const channel = service.getChannel('user-created', 'auth');

      expect(channel).toBe('auth-user-created');
    });

    it('should return channel with undefined service', async () => {
      jest
        .spyOn(configService, 'get')
        .mockImplementation((apiTag: string) => (apiTag ? 'auth' : 'auth'));

      const channel = service.getChannel('user-created', null);

      expect(channel).toBe('auth-user-created');
    });
  });
});
