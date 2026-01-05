import { ConfigService } from '@nestjs/config';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { JwtAccessStrategy } from './jwt-access.strategy';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';
import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { JWTAccessTokenPayLoad } from '@auth/domain/types/jwt-tokens-payload';
import { defaultRoles } from '@auth/domain/types/permissions';
import { Request } from 'express';
import { Cookies } from '@auth/domain/enums/cookies.enum';
import CookieService from '@auth/infrastructure/adaptars/secondary/cookie-service/cookie.service';

describe('JwtAccessStrategy', () => {
  let strategy: JwtAccessStrategy;
  let configService: ConfigService<EnvironmentVariables>;
  let cookieService: CookieService;

  beforeEach(async () => {
    configService = {
      get: jest.fn().mockReturnValue('secret-test-key'),
    } as any;

    cookieService = {
      extractFromRequest: jest.fn(),
    } as any;

    strategy = new JwtAccessStrategy(configService, cookieService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
    expect(configService).toBeDefined();
    expect(cookieService).toBeDefined();
  });

  describe('validate', () => {
    it('should validate payload and return userID', async () => {
      const payload: JWTAccessTokenPayLoad = {
        sub: IDConstants.EXEMPLE,
        email: EmailConstants.EXEMPLE,
        exp: 1000,
        iat: 1000,
        roles: defaultRoles,
        type: 'access',
      };

      const result = strategy.validate(payload);

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
        Cookies.AccessToken,
      );
    });
  });
});
