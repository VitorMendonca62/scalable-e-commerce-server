import { Cookies } from '@auth/domain/enums/cookies.enum';
import {
  EnvironmentVariables,
  NodeEnv,
} from '@config/environment/env.validation';
import { ConfigService } from '@nestjs/config';
import CookieService from './cookie.service';
import { type Mock } from 'vitest';
import { FastifyReply } from 'fastify';

describe('CookieService', () => {
  let service: CookieService;

  let configService: ConfigService<EnvironmentVariables>;

  beforeEach(async () => {
    configService = {
      get: vi.fn(),
    } as any;

    service = new CookieService(configService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(configService).toBeDefined();
  });

  const response: FastifyReply = {
    setCookie: vi.fn(),
  } as any;

  describe('setCookie', () => {
    const cookieName = Cookies.AccessToken;
    const value = 'TOKEN';
    const age = 1000;

    it('should call response.setCookie function with cookie name, value and all parameters', async () => {
      (configService.get as Mock).mockReturnValue(NodeEnv.Production);

      service.setCookie(cookieName, value, age, response);

      expect(response.setCookie).toHaveBeenCalledWith(cookieName, value, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: age,
        path: '/',
        signed: true,
      });
    });

    it('should secure is false if NODE_ENV in configService not is production', async () => {
      (configService.get as Mock).mockReturnValue(NodeEnv.Development);

      service.setCookie(cookieName, value, age, response);

      expect(response.setCookie).toHaveBeenCalledWith(cookieName, value, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: age,
        path: '/',
        signed: true,
      });
    });

    it('should secure is true if NODE_ENV in configService is production', async () => {
      (configService.get as Mock).mockReturnValue(NodeEnv.Production);

      service.setCookie(cookieName, value, age, response);

      expect(response.setCookie).toHaveBeenCalledWith(cookieName, value, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: age,
        path: '/',
        signed: true,
      });
    });
  });
});
