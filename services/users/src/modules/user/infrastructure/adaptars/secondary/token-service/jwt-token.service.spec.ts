import { verify } from 'crypto';
import { JwtTokenService } from './jwt-token.service';
import { JwtService } from '@nestjs/jwt';
import { WrongCredentials } from '@modules/user/domain/ports/primary/http/error.port';

describe('JwtTokenService', () => {
  let service: JwtTokenService;
  let jwtService: JwtService;

  const userId = 'userId';
  const token = 'T0K3n';

  beforeAll(() => {
    jwtService = {
      verify: jest.fn(),
    } as any;
  });

  beforeEach(async () => {
    service = new JwtTokenService(jwtService);
    (jwtService.verify as jest.Mock).mockReturnValue({
      sub: userId,
      teste: '2343',
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('verifyToken', () => {
    it('should call jwt verify function with correct parameters', async () => {
      service.verifyToken(token);

      expect(jwtService.verify).toHaveBeenCalledWith(token);
    });

    it('should return playload', async () => {
      const result = service.verifyToken(token);

      expect(typeof result).toBe('object');
      expect(result).toEqual({ sub: userId, teste: '2343' });
    });

    it('should return playload', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Error in verify token');
      });

      expect(() => service.verifyToken(token)).toThrow(
        new WrongCredentials('Token inválido ou expirado'),
      );
    });
  });
});
