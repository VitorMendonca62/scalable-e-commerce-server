import { JwtTokenService } from './jwt-token.service';
import { mockUserLikeJSON } from '@auth/infrastructure/helpers/tests/user-helper';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { JwtService } from '@nestjs/jwt';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { ConfigService } from '@nestjs/config';

describe('JwtTokenService', () => {
  let service: JwtTokenService;
  let jwtService: JwtService;

  let configService: ConfigService<EnvironmentVariables>;

  const userId = 'userId';
  const token = 'T0K3n';
  const resetPassSecret = 'SECRET';

  beforeEach(async () => {
    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    } as any;

    configService = {
      get: jest.fn().mockReturnValue(resetPassSecret),
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
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);
    });

    it('should call jwt sign function with correct parameters', async () => {
      service.generateRefreshToken(userId);

      const playload = {
        sub: userId,
        type: 'refresh',
      };

      expect(jwtService.sign).toHaveBeenCalledWith(playload, {
        expiresIn: '7D',
      });
    });

    it('should return token', async () => {
      const result = service.generateRefreshToken(userId);

      expect(typeof result).toBe('string');
      expect(result).toBe(token);
    });
  });

  describe('generateAccessToken', () => {
    beforeEach(async () => {
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);
    });

    const userJSON = mockUserLikeJSON();

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

      expect(jwtService.sign).toHaveBeenCalledWith(playload, {
        expiresIn: '1h',
      });
    });

    it('should return token', async () => {
      const result = service.generateAccessToken(userJSON);

      expect(typeof result).toBe('string');
      expect(result).toBe(token);
    });
  });

  describe('generateResetPassToken', () => {
    beforeEach(async () => {
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);
    });

    const userJSON = mockUserLikeJSON();

    it('should call jwt sign function with correct parameters', async () => {
      const props = {
        email: userJSON.email,
      };

      service.generateResetPassToken({ ...props });

      const playload = {
        sub: userJSON.email,
        type: 'reset-pass',
      };

      expect(configService.get).toHaveBeenCalledWith('RESET_PASS_SECRET');
      expect(jwtService.sign).toHaveBeenCalledWith(playload, {
        expiresIn: '10m',
        secret: resetPassSecret,
      });
    });

    it('should return token', async () => {
      const result = service.generateResetPassToken(userJSON);

      expect(typeof result).toBe('string');
      expect(result).toBe(token);
    });
  });

  describe('verifyResetPassToken', () => {
    beforeEach(async () => {
      jest.spyOn(jwtService, 'verify').mockReturnValue({ sub: userId });
    });

    it('should call jwt verify function with correct parameters', async () => {
      service.verifyResetPassToken(token);

      expect(jwtService.verify).toHaveBeenCalledWith(token);
    });

    it('should return playload', async () => {
      const result = service.verifyResetPassToken(token);

      expect(typeof result).toBe('object');
      expect(result).toEqual({ sub: userId });
    });

    it('should throw error if token is invalid ou expired', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Error verifying token');
      });

      expect(() => service.verifyResetPassToken(token)).toThrow(
        new WrongCredentials(
          'Token de recuperação de senha inválido ou expirado. Realize o processo novamente.',
        ),
      );
    });
  });

  describe('verifyToken', () => {
    beforeEach(async () => {
      jest.spyOn(jwtService, 'verify').mockReturnValue({ sub: userId });
    });

    it('should call jwt verify function with correct parameters', async () => {
      service.verifyToken(token);

      expect(jwtService.verify).toHaveBeenCalledWith(token);
    });

    it('should return playload', async () => {
      const result = service.verifyToken(token);

      expect(typeof result).toBe('object');
      expect(result).toEqual({ sub: userId });
    });

    it('should throw error if token is invalid ou expired', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Error verifying token');
      });

      expect(() => service.verifyToken(token)).toThrow(
        new WrongCredentials('Token inválido ou expirado'),
      );
    });
  });
});
