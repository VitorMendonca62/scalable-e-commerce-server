import IDConstants from '@auth/domain/values-objects/id/id-constants';
import { FinishSessionUseCase } from './finish-session.usecase';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';
import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';

describe('FinishSessionUseCase', () => {
  let useCase: FinishSessionUseCase;

  let tokenRepository: TokenRepository;

  beforeEach(async () => {
    tokenRepository = {
      revokeOneSession: vi.fn(),
    } as any;

    useCase = new FinishSessionUseCase(tokenRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(tokenRepository).toBeDefined();
  });

  describe('execute', () => {
    const tokenID = `token-${IDConstants.EXEMPLE}`;
    const userID = IDConstants.EXEMPLE;

    it('should use case tokenRepository,revokeOneSession with tokenid and userID', async () => {
      await useCase.execute(tokenID, userID);

      expect(tokenRepository.revokeOneSession).toHaveBeenCalledWith(
        tokenID,
        userID,
      );
    });

    it('should return NOT_POSSIBLE when repository throws error', async () => {
      vi.spyOn(tokenRepository, 'revokeOneSession').mockRejectedValue(
        new Error('Error revoking session'),
      );

      const result = await useCase.execute(tokenID, userID);

      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro inesperado. Tente novamente mais tarde.',
      });
    });
  });
});
