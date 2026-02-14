import { ExecutionContext } from '@nestjs/common';
import RevocationGuard from './revocation.guard';
import IDConstants from '@auth/domain/values-objects/id/id-constants';
import { InvalidToken } from '@auth/domain/ports/primary/http/errors.port';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';

describe('RevocationGuard', () => {
  let guard: RevocationGuard;

  let tokenRepository: TokenRepository;

  beforeEach(() => {
    tokenRepository = {
      isRevoked: vi.fn(),
    } as any;

    guard = new RevocationGuard(tokenRepository);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
    expect(tokenRepository).toBeDefined();
  });

  describe('canActivate', () => {
    let executionContext: ExecutionContext;
    const switchToHttpMock = vi.fn();
    const getRequestMock = vi.fn();

    beforeEach(() => {
      executionContext = { switchToHttp: switchToHttpMock } as any;
      switchToHttpMock.mockReturnValue({ getRequest: getRequestMock });
    });

    it('should return the true if token not is revoked', async () => {
      getRequestMock.mockReturnValue({
        headers: { 'x-token-id': IDConstants.EXEMPLE },
      });

      const result = await guard.canActivate(executionContext);

      expect(result).toBe(true);
    });

    it('should throw InvalidToken if token is empyt', async () => {
      try {
        getRequestMock.mockReturnValue({
          headers: { 'x-token-id': '' },
        });
        await guard.canActivate(executionContext);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(InvalidToken);
        expect(error.message).toBe('Sessão inválida. Faça login novamente.');
        expect(error.data).toBeUndefined();
      }

      try {
        getRequestMock.mockReturnValue({
          headers: { 'x-token-id': undefined },
        });
        await guard.canActivate(executionContext);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(InvalidToken);
        expect(error.message).toBe('Sessão inválida. Faça login novamente.');
        expect(error.data).toBeUndefined();
      }

      try {
        getRequestMock.mockReturnValue({
          headers: { 'x-token-id': null },
        });
        await guard.canActivate(executionContext);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(InvalidToken);
        expect(error.message).toBe('Sessão inválida. Faça login novamente.');
        expect(error.data).toBeUndefined();
      }
    });
    it('should throw InvalidToken if token is revoked', async () => {
      const tokenID = IDConstants.EXEMPLE;

      getRequestMock.mockReturnValue({
        headers: { 'x-token-id': tokenID },
      });

      vi.spyOn(tokenRepository, 'isRevoked').mockResolvedValue(true);

      try {
        await guard.canActivate(executionContext);
        expect(tokenRepository.isRevoked).toHaveBeenCalledWith(tokenID);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(InvalidToken);
        expect(error.message).toBe('Sessão inválida. Faça login novamente.');
        expect(error.data).toBeUndefined();
      }
    });
  });
});
