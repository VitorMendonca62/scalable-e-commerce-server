import { ConfigService } from '@nestjs/config';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';
import { JWTRefreshTokenPayLoad } from '@auth/domain/types/jwt-tokens-payload';

describe('JwtRefreshStrategy', () => {
  let strategy: JwtRefreshStrategy;
  let configService: ConfigService<EnvironmentVariables>;
  let tokenRepository: TokenRepository;

  beforeEach(async () => {
    configService = {
      get: jest.fn().mockReturnValue('secret-test-key'),
    } as any;

    tokenRepository = {
      isRevoked: jest.fn(),
    } as any;

    strategy = new JwtRefreshStrategy(configService, tokenRepository);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('validate', () => {
    const payload: JWTRefreshTokenPayLoad = {
      sub: IDConstants.EXEMPLE,
      jti: IDConstants.EXEMPLE,
      exp: 11111,
      iat: 11111,
      type: 'refresh',
    };
    beforeEach(() => {
      jest.spyOn(tokenRepository, 'isRevoked').mockResolvedValue(false);
    });

    it('should validate payload and return userID and tokenID', async () => {
      const result = await strategy.validate(payload);

      expect(result).toEqual({
        userID: IDConstants.EXEMPLE,
        tokenID: IDConstants.EXEMPLE,
      });
    });

    it('should throw WrongCredentials if payload is undefined ', async () => {
      try {
        await strategy.validate(undefined);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(WrongCredentials);
        expect(error.message).toBe('Sessão inválida. Faça login novamente.');
        expect(error.data).toBeUndefined();
      }
    });

    it('should throw WrongCredentials if payload is null ', async () => {
      try {
        await strategy.validate(null);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(WrongCredentials);
        expect(error.message).toBe('Sessão inválida. Faça login novamente.');
        expect(error.data).toBeUndefined();
      }
    });

    it('should throw WrongCredentials if token is revoked ', async () => {
      jest.spyOn(tokenRepository, 'isRevoked').mockResolvedValue(true);

      try {
        await strategy.validate(payload);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(WrongCredentials);
        expect(error.message).toBe('Sessão inválida. Faça login novamente.');
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('jwtFromRequest', () => {
    it('should extract refresh token in cookies', () => {
      const extractFunction = (strategy as any)._jwtFromRequest;

      const token = extractFunction({
        cookies: {
          refresh_token: 'Bearer token-value',
        },
      });

      expect(token).toBe('token-value');
    });

    it('should return null when extract failure refresh token in cookies ', () => {
      const extractFunction = (strategy as any)._jwtFromRequest;

      const token = extractFunction({
        cookies: {
          refresh_token: undefined,
        },
      });

      expect(token).toBeNull();
    });
  });
});
