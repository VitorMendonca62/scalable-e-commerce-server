import { IDConstants } from '@auth/domain/values-objects/id/id-constants';
import { FinishSessionUseCase } from './finish-session.usecase';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';

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
  });
});
