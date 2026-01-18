import { JwtTokenService } from './jwt-token.service';
import { mockUserModel } from '@auth/infrastructure/helpers/tests/user-mocks';
import { JwtService } from '@nestjs/jwt';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { ConfigService } from '@nestjs/config';

jest.mock('uuid', () => {
  return { __esModule: true, v7: jest.fn() };
});

jest.mock('fs', () => {
  return {
    __esModule: true,
    readFileSync: jest.fn(),
  };
});

jest.mock('path', () => {
  return {
    __esModule: true,
    join: jest.fn(),
  };
});

import { v7 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';

describe('JwtTokenService', () => {
  let service: JwtTokenService;
  let jwtService: JwtService;

  let configService: ConfigService<EnvironmentVariables>;

  const userId = 'userId';
  const token = 'T0K3n';
  const resetPassKeyID = 'SECRET';
  const authKeyID = 'SECRET';

  beforeEach(async () => {
    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    } as any;

    configService = {
      get: jest.fn(),
    } as any;

    service = new JwtTokenService(jwtService, configService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('generateRefreshToken', () => {
    beforeEach(async () => {
      (v7 as jest.Mock).mockReturnValue(IDConstants.EXEMPLE);

      jest.spyOn(jwtService, 'sign').mockReturnValue(token);
      jest.spyOn(configService, 'get').mockReturnValue(authKeyID);
    });

    it('should call jwt sign function with correct parameters', async () => {
      service.generateRefreshToken(userId);

      const playload = {
        sub: userId,
        jti: IDConstants.EXEMPLE,
        type: 'refresh',
      };

      expect(configService.get).toHaveBeenCalledWith('AUTH_JWT_KEYID');
      expect(jwtService.sign).toHaveBeenCalledWith(playload, {
        expiresIn: '7D',
        keyid: authKeyID,
      });
    });

    it('should return token and tokenID', async () => {
      const result = service.generateRefreshToken(userId);

      expect(typeof result).toBe('object');
      expect(result).toEqual({
        refreshToken: token,
        tokenID: IDConstants.EXEMPLE,
      });
    });
  });

  describe('generateAccessToken', () => {
    beforeEach(async () => {
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);
      jest.spyOn(configService, 'get').mockReturnValue(authKeyID);
    });

    const userJSON = mockUserModel();

    it('should call jwt sign function with correct parameters', async () => {
      const props = {
        email: userJSON.email,
        roles: userJSON.roles,
      };
      service.generateAccessToken({ ...props, userID: userJSON.userID });

      const playload = {
        ...props,
        sub: userJSON.userID,
        type: 'access',
      };

      expect(configService.get).toHaveBeenCalledWith('AUTH_JWT_KEYID');
      expect(jwtService.sign).toHaveBeenCalledWith(playload, {
        expiresIn: '1h',
        keyid: authKeyID,
      });
    });

    it('should return token', async () => {
      const result = service.generateAccessToken(userJSON);

      expect(typeof result).toBe('string');
      expect(result).toBe(token);
    });
  });

  describe('generateResetPassToken', () => {
    const mockPrivateKey = 'mock-private-key-content';
    const mockPath = '/mock/path/to/reset-pass-private.pem';

    beforeEach(async () => {
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);
      jest.spyOn(configService, 'get').mockReturnValue(resetPassKeyID);
      jest.spyOn(path, 'join').mockReturnValue(mockPath);
      jest.spyOn(fs, 'readFileSync').mockReturnValue(mockPrivateKey);
    });

    const userJSON = mockUserModel();

    it('should call jwt sign function with correct parameters', async () => {
      const props = {
        email: userJSON.email,
      };

      service.generateResetPassToken({ ...props });

      const playload = {
        sub: userJSON.email,
        type: 'reset-pass',
      };

      expect(path.join).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalledWith(mockPath);
      expect(configService.get).toHaveBeenCalledWith('RESET_PASS_KEYID');
      expect(jwtService.sign).toHaveBeenCalledWith(playload, {
        expiresIn: '10m',
        privateKey: mockPrivateKey,
        keyid: resetPassKeyID,
      });
    });

    it('should return token', async () => {
      const result = service.generateResetPassToken(userJSON);

      expect(typeof result).toBe('string');
      expect(result).toBe(token);
    });
  });
});
