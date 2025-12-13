import { JwtTokenService } from './jwt-token.service';
import { mockUserLikeJSON } from '@auth/infrastructure/helpers/tests/tests.helper';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { JwtService } from '@nestjs/jwt';

describe('JwtTokenService', () => {
  let service: JwtTokenService;
  let jwtService: JwtService;

  const userId = 'userId';
  const token = 'T0K3n';

  beforeEach(async () => {
    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    } as any;

    service = new JwtTokenService(jwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(jwtService).toBeDefined();
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

  describe('generateRefreshToken', () => {
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
