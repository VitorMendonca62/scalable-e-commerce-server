import { IdInTokenPipe } from './id-in-token.pipe';
import { TokenService } from '@user/domain/ports/secondary/token-service.port';
import { WrongCredentials } from '@user/domain/ports/primary/http/error.port';

describe('IdInTokenPipe', () => {
  let pipe: IdInTokenPipe;
  let tokenService: jest.Mocked<TokenService>;

  const token = 'abc123';
  const authorization = `Bearer ${token}`;

  beforeEach(() => {
    tokenService = { verifyToken: jest.fn() } as unknown as jest.Mocked<TokenService>;
    pipe = new IdInTokenPipe(tokenService);
  });

  it('should return sub from token payload', () => {
    tokenService.verifyToken.mockReturnValue({ sub: 'user-1' });

    const response = pipe.transform(authorization);

    expect(response).toBe('user-1');
    expect(typeof response).toBe('string');
    expect(tokenService.verifyToken).toHaveBeenCalledWith(token);
  });

  it('should throw when header is undefined or null', () => {
    expect(() => pipe.transform(undefined as any)).toThrow(new WrongCredentials());
    expect(() => pipe.transform(null as any)).toThrow(new WrongCredentials());
  });

  it("should throw when header doesn't start with Bearer", () => {
    expect(() => pipe.transform('Token abc')).toThrow(new WrongCredentials());
  });

  it('should throw when sub is missing or invalid', () => {
    tokenService.verifyToken.mockReturnValue({});
    expect(() => pipe.transform(authorization)).toThrow(new WrongCredentials());

    tokenService.verifyToken.mockReturnValue({ sub: null });
    expect(() => pipe.transform(authorization)).toThrow(new WrongCredentials());

    tokenService.verifyToken.mockReturnValue({ sub: undefined });
    expect(() => pipe.transform(authorization)).toThrow(new WrongCredentials());
  });
});

