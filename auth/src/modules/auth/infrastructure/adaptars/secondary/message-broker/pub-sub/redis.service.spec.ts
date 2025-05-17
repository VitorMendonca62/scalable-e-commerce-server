import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { ClientProxy } from '@nestjs/microservices';
import { defaultRoles } from '@modules/auth/domain/types/permissions';
import EmailVO from '@modules/auth/domain/values-objects/email.vo';
import NameVO from '@modules/auth/domain/values-objects/name.vo';
import UsernameVO from '@modules/auth/domain/values-objects/username.vo';
import PhoneNumberVO from '@modules/auth/domain/values-objects/phonenumber.vo';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { PubSubMessageBroker } from '@modules/auth/domain/ports/secondary/pub-sub.port';

describe('RedisService', () => {
  let service: PubSubMessageBroker;
  let clientProxyMock: jest.Mocked<ClientProxy>;
  let configService: ConfigService;

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
    configService = module.get<ConfigService>(ConfigService);
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
        email: EmailVO.EXEMPLE,
        name: NameVO.EXEMPLE,
        username: UsernameVO.EXEMPLE,
        phonenumber: PhoneNumberVO.EXEMPLE,
      };
      const channel = 'user-created';

      const expectedChannel = 'auth-user-created';

      await service.publish(channel, value, serviceName);

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
