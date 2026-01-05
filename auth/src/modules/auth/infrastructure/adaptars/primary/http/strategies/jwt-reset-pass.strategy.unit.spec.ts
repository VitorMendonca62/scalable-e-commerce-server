import { ConfigService } from '@nestjs/config';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { JwtResetPassStrategy } from './jwt-reset-pass.strategy';
import { JWTResetPassTokenPayLoad } from '@auth/domain/types/jwt-tokens-payload';
import { Cookies } from '@auth/domain/enums/cookies.enum';
import CookieService from '@auth/infrastructure/adaptars/secondary/cookie-service/cookie.service';

describe('JwtResetPassStrategy', () => {
  let strategy: JwtResetPassStrategy;
  let configService: ConfigService<EnvironmentVariables>;
  let cookieService: CookieService;

  beforeEach(async () => {
    configService = {
      get: jest.fn().mockReturnValue('secret-test-key'),
    } as any;

    cookieService = {
      extractFromRequest: jest.fn(),
    } as any;

    strategy = new JwtResetPassStrategy(configService, cookieService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
    expect(configService).toBeDefined();
    expect(cookieService).toBeDefined();
  });

  describe('validate', () => {
    it('should validate payload and return userID', async () => {
      const payload: JWTResetPassTokenPayLoad = {
        sub: EmailConstants.EXEMPLE,
        exp: 1000,
        iat: 1000,
        type: 'reset-pass',
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({ email: EmailConstants.EXEMPLE });
    });

    it('should throw WrongCredentials if payload is undefined ', async () => {
      try {
        strategy.validate(undefined);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(WrongCredentials);
        expect(error.message).toBe(
          'Sessão inválida. Realize o processo de recupeção de senha novamente.',
        );
        expect(error.data).toBeUndefined();
      }
    });

    it('should throw WrongCredentials if payload is null ', async () => {
      try {
        strategy.validate(null);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(WrongCredentials);
        expect(error.message).toBe(
          'Sessão inválida. Realize o processo de recupeção de senha novamente.',
        );
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('jwtFromRequest', () => {
    const request: Request = {
      cookies: {
        refresh_token: 'Bearer token-value',
      },
    } as any;

    it('should call cookieService.extractFromRequest with Request and Cookie name', () => {
      const extractFunction = (strategy as any)._jwtFromRequest;

      extractFunction(request);

      expect(cookieService.extractFromRequest).toHaveBeenCalledWith(
        request,
        Cookies.ResetPassToken,
      );
    });
  });
});
