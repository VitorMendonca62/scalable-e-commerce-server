import { GetAccessTokenUseCase } from './get-access-token';
import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import { mockUserLikeJSON } from '@auth/infrastructure/helpers/tests/user-helper';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { TokenService } from '@auth/domain/ports/secondary/token-service.port';

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
    const user = mockUserLikeJSON();
    const accessToken = 'ACCESSTOKEN';

    beforeEach(() => {
      jest
        .spyOn(tokenService, 'generateAccessToken')
        .mockReturnValue(accessToken);

      jest
        .spyOn(tokenService, 'verifyToken')
        .mockReturnValue({ sub: 'USERID' });
    });

    it('should use case call functions with correct parameters and return token', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const response = await useCase.execute(user.userID);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        userID: user.userID,
      });
      expect(tokenService.generateAccessToken).toHaveBeenCalledWith(user);
      expect(response).toBe(`Bearer ${accessToken}`);
    });

    it('should throw bad request exception when user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      await expect(useCase.execute(user.userID)).rejects.toThrow(
        new WrongCredentials('Token inválido ou expirado'),
      );
    });
  });
});
