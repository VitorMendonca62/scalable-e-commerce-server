import { GetAccessTokenUseCase } from './get-access-token';
import { TokenService } from '@modules/auth/domain/ports/primary/session.port';
import { UserRepository } from '@modules/auth/domain/ports/secondary/user-repository.port';
import { userLikeJSON } from '@modules/auth/infrastructure/helpers/tests/tests.helper';
import { WrongCredentials } from '@modules/auth/domain/ports/primary/http/errors.port';

describe('GetAccessTokenUseCase', () => {
  let useCase: GetAccessTokenUseCase;

  let userRepository: UserRepository;
  let tokenService: TokenService;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
    } as any;

    tokenService = {
      verifyToken: jest.fn(),
      generateAccessToken: jest.fn(),
    } as any;

    useCase = new GetAccessTokenUseCase(userRepository, tokenService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(tokenService).toBeDefined();
  });

  describe('execute', () => {
    const user = userLikeJSON({ _id: 'USERID' });
    const refreshToken = 'REFRESHTOKEN';
    const accessToken = 'Bearer ACCESSTOKEN';

    beforeEach(() => {
      jest
        .spyOn(tokenService, 'generateAccessToken')
        .mockReturnValue(accessToken);

      jest
        .spyOn(tokenService, 'verifyToken')
        .mockReturnValue({ sub: 'USERID' });
    });

    it('should use case call with correct parameters and return token', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const response = await useCase.execute(refreshToken);

      expect(userRepository.findOne).toHaveBeenCalledWith({ _id: user._id });
      expect(tokenService.generateAccessToken).toHaveBeenCalledWith(user);
      expect(tokenService.verifyToken).toHaveBeenCalledWith(refreshToken);
      expect(response).toBe(accessToken);
    });

    it('should throw bad request exception when user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      await expect(useCase.execute(refreshToken)).rejects.toThrow(
        new WrongCredentials('Token inválido ou expirado'),
      );
    });
  });
});
