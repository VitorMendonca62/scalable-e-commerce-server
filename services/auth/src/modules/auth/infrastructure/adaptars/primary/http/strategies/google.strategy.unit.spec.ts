import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './google.strategy';

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;
  let configService: ConfigService<EnvironmentVariables>;

  const clientID = IDConstants.EXEMPLE;
  const clientSecret = 'secret';
  const callbackURL = 'localhost.com';
  const scope = ['email', 'profile'];

  beforeEach(async () => {
    configService = {
      get: vi.fn((key: string) => {
        const config = {
          GOOGLE_CLIENT_ID: clientID,
          GOOGLE_CLIENT_SECRET: clientSecret,
          GOOGLE_CALLBACK_URL: callbackURL,
        };

        return config[key];
      }),
    } as any;

    strategy = new GoogleStrategy(configService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('validate', () => {
    const profile: UserGoogle = {
      displayName: 'test',
      emails: [{ value: EmailConstants.EXEMPLE, verified: true }],
      id: IDConstants.EXEMPLE,
      name: { familyName: 'test', givenName: 'tests' },
      photos: null,
    };

    it('should call done function with null and user', async () => {
      const mockDoneFunction = vi.fn();

      await strategy.validate('', '', profile, mockDoneFunction);
      expect(mockDoneFunction).toHaveBeenCalledWith(null, {
        email: profile.emails[0].value,
        username: profile.displayName.replaceAll(' ', ''),
        name: `${profile.name.givenName} ${profile.name.familyName}`,
        id: IDConstants.EXEMPLE,
      });
    });
  });

  describe('constructor', () => {
    it('should get parameters from configService', () => {
      expect(configService.get).toHaveBeenNthCalledWith(1, 'GOOGLE_CLIENT_ID');
      expect(configService.get).toHaveBeenNthCalledWith(
        2,
        'GOOGLE_CLIENT_SECRET',
      );
      expect(configService.get).toHaveBeenNthCalledWith(
        3,
        'GOOGLE_CALLBACK_URL',
      );

      expect((strategy as any)._oauth2._clientId).toBe(clientID);
      expect((strategy as any)._oauth2._clientSecret).toBe(clientSecret);
      expect((strategy as any)._callbackURL).toBe(callbackURL);
      expect((strategy as any)._scope).toEqual(scope);
    });
  });
});
