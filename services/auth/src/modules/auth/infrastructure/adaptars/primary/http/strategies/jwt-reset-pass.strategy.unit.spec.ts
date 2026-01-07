import { ConfigService } from '@nestjs/config';
import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { JwtResetPassStrategy } from './jwt-reset-pass.strategy';
import { JWTResetPassTokenPayLoad } from '@auth/domain/types/jwt-tokens-payload';
import { Cookies } from '@auth/domain/enums/cookies.enum';
import CookieService from '@auth/infrastructure/adaptars/secondary/cookie-service/cookie.service';
import { JwtPayloadValidator } from '@auth/infrastructure/validators/jwt-payload.validator';

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

    jest.spyOn(JwtPayloadValidator, 'validate').mockReturnValue(undefined);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
    expect(configService).toBeDefined();
    expect(cookieService).toBeDefined();
  });

  describe('validate', () => {
    const payload: JWTResetPassTokenPayLoad = {
      sub: EmailConstants.EXEMPLE,
      exp: 1000,
      iat: 1000,
      type: 'reset-pass',
    };

    it('should validate payload and return userID', async () => {
      const result = strategy.validate(payload);

      expect(result).toEqual({ email: EmailConstants.EXEMPLE });
    });

    it('should call JwtPayloadValidator.validate with correct parameters', async () => {
      strategy.validate(payload);
      expect(JwtPayloadValidator.validate).toHaveBeenCalledWith(
        payload,
        'Sessão inválida. Realize o processo de recupeção de senha novamente.',
        'reset-pass',
      );
    });

    it('should rethrow error if JwtPayloadValidator.validate throw any error ', async () => {
      jest.spyOn(JwtPayloadValidator, 'validate').mockImplementation(() => {
        throw Error('Error');
      });

      try {
        strategy.validate(undefined);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error');
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
        Cookies.ResetPassToken,
      );
    });
  });
});
