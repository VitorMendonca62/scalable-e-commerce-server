import { Cookies } from '@auth/domain/enums/cookies.enum';
import {
  EnvironmentVariables,
  NodeEnv,
} from '@config/environment/env.validation';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import CookieService from './cookie.service';

describe('CookieService', () => {
  let service: CookieService;

  let configService: ConfigService<EnvironmentVariables>;

  beforeEach(async () => {
    configService = {
      get: jest.fn(),
    } as any;

    service = new CookieService(configService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(configService).toBeDefined();
  });

  const response: Response = {
    cookie: jest.fn(),
  } as any;

  const token = 'TOKEN';

  const request: Request = {
    cookies: {
      access_token: token,
    },
  } as any;

  describe('setCookie', () => {
    const cookieName = Cookies.AccessToken;
    const value = 'TOKEN';
    const age = 1000;

    it('should call response.cookie function with cookie name, value and all parameters', async () => {
      (configService.get as jest.Mock).mockReturnValue(NodeEnv.Production);

      service.setCookie(cookieName, value, age, response);

      expect(response.cookie).toHaveBeenCalledWith(cookieName, value, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: age,
        path: '/',
      });
    });

    it('should secure is false if NODE_ENV in configService not is production', async () => {
      (configService.get as jest.Mock).mockReturnValue(NodeEnv.Development);

      service.setCookie(cookieName, value, age, response);

      expect(response.cookie).toHaveBeenCalledWith(cookieName, value, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: age,
        path: '/',
      });
    });

    it('should secure is true if NODE_ENV in configService is production', async () => {
      (configService.get as jest.Mock).mockReturnValue(NodeEnv.Production);

      service.setCookie(cookieName, value, age, response);

      expect(response.cookie).toHaveBeenCalledWith(cookieName, value, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: age,
        path: '/',
      });
    });
  });

  describe('extractFromRequest', () => {
    const cookieName = Cookies.AccessToken;

    it('should return token without on sucess', async () => {
      const result = service.extractFromRequest(request, cookieName);

      expect(result).toBe(token);
    });

    it('should return null if request.cookies is null or undefined', async () => {
      const nullRequest: Request = {
        cookies: null,
      } as any;

      const nullResult = service.extractFromRequest(nullRequest, cookieName);

      expect(nullResult).toBeNull();

      const undefinedRequest: Request = {
        cookies: undefined,
      } as any;

      const undefinedResult = service.extractFromRequest(
        undefinedRequest,
        cookieName,
      );

      expect(undefinedResult).toBeNull();
    });

    it('should return null if request.cookies.cookiename is null or undefined', async () => {
      const nullRequest: Request = {
        cookies: {
          access_token: null,
        },
      } as any;

      const nullResult = service.extractFromRequest(nullRequest, cookieName);

      expect(nullResult).toBeNull();

      const undefinedRequest: Request = {
        cookies: {
          access_token: undefined,
        },
      } as any;

      const undefinedResult = service.extractFromRequest(
        undefinedRequest,
        cookieName,
      );

      expect(undefinedResult).toBeNull();
    });
  });
});
