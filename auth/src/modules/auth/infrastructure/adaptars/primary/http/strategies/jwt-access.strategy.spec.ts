import { ConfigService } from '@nestjs/config';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { JwtAccessStrategy } from './jwt-access.strategy';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';
import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { EnvironmentVariables } from '@config/environment/env.validation';

describe('JwtAccessStrategy', () => {
  let strategy: JwtAccessStrategy;
  let configService: ConfigService<EnvironmentVariables>;

  beforeEach(async () => {
    configService = {
      get: jest.fn().mockReturnValue('secret-test-key'),
    } as any;

    strategy = new JwtAccessStrategy(configService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('validate', () => {
    it('should validate payload and return userID', async () => {
      const payload = {
        sub: IDConstants.EXEMPLE,
        email: EmailConstants.EXEMPLE,
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({ userID: IDConstants.EXEMPLE });
    });

    it('should throw WrongCredentials if payload is undefined ', async () => {
      try {
        strategy.validate(undefined);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(WrongCredentials);
        expect(error.message).toBe('Token inválido ou expirado');
        expect(error.data).toBeUndefined();
      }
    });

    it('should throw WrongCredentials if payload is null ', async () => {
      try {
        strategy.validate(null);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(WrongCredentials);
        expect(error.message).toBe('Token inválido ou expirado');
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('jwtFromRequest', () => {
    it('should extract access token in cookies', () => {
      const extractFunction = (strategy as any)._jwtFromRequest;

      const mockRequest = {
        cookies: {
          access_token: 'Bearer token-value',
        },
      } as any;

      const token = extractFunction(mockRequest);

      expect(token).toBe('token-value');
    });

    it('should return null when extract failure access token in cookies ', () => {
      const extractFunction = (strategy as any)._jwtFromRequest;

      const mockRequest = {
        cookies: undefined,
      } as any;

      const token = extractFunction(mockRequest);

      expect(token).toBeNull();
    });
  });
});
