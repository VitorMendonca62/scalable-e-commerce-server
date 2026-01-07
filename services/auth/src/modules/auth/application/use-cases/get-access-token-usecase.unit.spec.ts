import { GetAccessTokenUseCase } from './get-access-token.usecase';
import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import { mockUserLikeJSON } from '@auth/infrastructure/helpers/tests/user-mocks';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';

describe('GetAccessTokenUseCase', () => {
  let useCase: GetAccessTokenUseCase;

  let userRepository: UserRepository;
  let tokenService: TokenService;
  let tokenRepository: TokenRepository;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
    } as any;

    tokenService = {
      verifyToken: jest.fn(),
      generateAccessToken: jest.fn(),
    } as any;

    tokenRepository = {
      updateLastAcess: jest.fn(),
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
    const user = mockUserLikeJSON();
    const accessToken = 'ACCESSTOKEN';
    const tokenID = IDConstants.EXEMPLE;

    beforeEach(() => {
      jest
        .spyOn(tokenService, 'generateAccessToken')
        .mockReturnValue(accessToken);
    });

    it('should use case call functions with correct parameters and return token', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const response = await useCase.execute(user.userID, tokenID);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        userID: user.userID,
      });
      expect(tokenRepository.updateLastAcess).toHaveBeenCalledWith(tokenID);
      expect(tokenService.generateAccessToken).toHaveBeenCalledWith(user);
      expect(response).toBe(accessToken);
    });

    it('should throw bad request exception when user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      try {
        await useCase.execute(user.userID, tokenID);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(WrongCredentials);
        expect(error.message).toBe('Token inválido ou expirado');
        expect(error.data).toBeUndefined();
      }
    });
  });
});
