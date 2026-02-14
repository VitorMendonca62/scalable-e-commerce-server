import { GetAccessTokenUseCase } from './get-access-token.usecase';
import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import { UserFactory } from '@auth/infrastructure/helpers/tests/user-factory';
import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';
import IDConstants from '@auth/domain/values-objects/id/id-constants';
import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';

describe('GetAccessTokenUseCase', () => {
  let useCase: GetAccessTokenUseCase;

  let userRepository: UserRepository;
  let tokenService: TokenService;
  let tokenRepository: TokenRepository;

  beforeEach(async () => {
    userRepository = {
      findOne: vi.fn(),
    } as any;

    tokenService = {
      verifyToken: vi.fn(),
      generateAccessToken: vi.fn(),
    } as any;

    tokenRepository = {
      updateLastAcess: vi.fn(),
    } as any;

    useCase = new GetAccessTokenUseCase(
      userRepository,
      tokenService,
      tokenRepository,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(tokenService).toBeDefined();
  });

  describe('execute', () => {
    const user = UserFactory.createModel();
    const accessToken = 'ACCESSTOKEN';
    const tokenID = IDConstants.EXEMPLE;

    beforeEach(() => {
      vi.spyOn(tokenService, 'generateAccessToken').mockReturnValue(
        accessToken,
      );
    });

    it('should use case call functions with correct parameters and return token', async () => {
      vi.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      await useCase.execute(user.userID, tokenID);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        userID: user.userID,
      });
      expect(tokenRepository.updateLastAcess).toHaveBeenCalledWith(tokenID);
      expect(tokenService.generateAccessToken).toHaveBeenCalledWith(user);
    });

    it('should return token and ok on sucess', async () => {
      vi.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await useCase.execute(user.userID, tokenID);

      expect(result).toEqual({
        ok: true,
        result: accessToken,
      });
    });

    it('should return ok false and not found reason when user does not exist', async () => {
      vi.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      const result = await useCase.execute(user.userID, tokenID);
      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Sessão inválida. Faça login novamente.',
      });
    });
  });
});
