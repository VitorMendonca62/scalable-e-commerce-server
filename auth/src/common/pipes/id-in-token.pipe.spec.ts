import { IdInTokenPipe } from './id-in-token.pipe';
import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';

describe('IdInTokenPipe', () => {
  let pipe: IdInTokenPipe;
  let tokenService: jest.Mocked<TokenService>;

  const token = 'abc123';
  const authorization = `Bearer ${token}`;
  const userID = IDConstants.EXEMPLE;
  beforeEach(() => {
    tokenService = {
      verifyToken: jest.fn(),
    } as unknown as jest.Mocked<TokenService>;

    pipe = new IdInTokenPipe(tokenService);
  });

  it('should return sub from token payload', () => {
    tokenService.verifyToken.mockReturnValue({ sub: userID });

    const response = pipe.transform(authorization);

    expect(response).toBe(userID);
    expect(typeof response).toBe('string');
    expect(tokenService.verifyToken).toHaveBeenCalledWith(token);
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
