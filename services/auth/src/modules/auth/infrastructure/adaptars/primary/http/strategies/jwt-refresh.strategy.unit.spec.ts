import { ConfigService } from '@nestjs/config';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';
import { JWTRefreshTokenPayLoad } from '@auth/domain/types/jwt-tokens-payload';
import { Cookies } from '@auth/domain/enums/cookies.enum';
import CookieService from '@auth/infrastructure/adaptars/secondary/cookie-service/cookie.service';
import { JwtPayloadValidator } from '@auth/infrastructure/validators/jwt-payload.validator';

describe('JwtRefreshStrategy', () => {
  let strategy: JwtRefreshStrategy;
  let configService: ConfigService<EnvironmentVariables>;
  let tokenRepository: TokenRepository;
  let cookieService: CookieService;

  beforeEach(async () => {
    configService = {
      get: jest.fn().mockReturnValue('secret-test-key'),
    } as any;

    tokenRepository = {
      isRevoked: jest.fn(),
    } as any;

    cookieService = {
      extractFromRequest: jest.fn(),
    } as any;

    strategy = new JwtRefreshStrategy(
      configService,
      tokenRepository,
      cookieService,
    );
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
    expect(configService).toBeDefined();
    expect(cookieService).toBeDefined();
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
      jest.spyOn(JwtPayloadValidator, 'validate').mockReturnValue(undefined);
    });

    it('should validate payload and return userID and tokenID', async () => {
      const result = await strategy.validate(payload);

      expect(result).toEqual({
        userID: IDConstants.EXEMPLE,
        tokenID: IDConstants.EXEMPLE,
      });
    });

    it('should call JwtPayloadValidator.validate with correct parameters', async () => {
      await strategy.validate(payload);
      expect(JwtPayloadValidator.validate).toHaveBeenCalledWith(
        payload,
        'Sessão inválida. Faça login novamente.',
        'refresh',
      );
    });

    it('should rethrow error if JwtPayloadValidator.validate throw any error ', async () => {
      jest.spyOn(JwtPayloadValidator, 'validate').mockImplementation(() => {
        throw new Error('Error');
      });

      try {
        await strategy.validate(undefined);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error');
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
    const request: Request = {
      cookies: {
        refresh_token: 'token-value',
      },
    } as any;

    it('should call cookieService.extractFromRequest with Request and Cookie name', () => {
      const extractFunction = (strategy as any)._jwtFromRequest;

      extractFunction(request);

      expect(cookieService.extractFromRequest).toHaveBeenCalledWith(
        request,
        Cookies.RefreshToken,
      );
    });
  });
});
