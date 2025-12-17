// Mocks
import {
  mockUser,
  mockUserLikeJSON,
  mockLoginUser,
} from '@auth/infrastructure/helpers/tests/user-helper';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';

// Dependences
import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import { UserMapper } from '@auth/infrastructure/mappers/user.mapper';

// Ports
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';

// Function
import { CreateSessionUseCase } from './create-session.usecase';

describe('CreateSessionUseCase', () => {
  let useCase: CreateSessionUseCase;

  let userRepository: UserRepository;
  let tokenService: TokenService;
  let userMapper: UserMapper;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
    } as any;

    tokenService = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
    } as any;

    userMapper = {
      jsonToUser: jest.fn(),
    } as any;

    useCase = new CreateSessionUseCase(
      userRepository,
      tokenService,
      userMapper,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(tokenService).toBeDefined();
    expect(userMapper).toBeDefined();
  });

  describe('execute', () => {
    const user = mockUser();
    const userJSON = mockUserLikeJSON();
    const userLogin = mockLoginUser();

    beforeEach(() => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userJSON);
      jest.spyOn(userMapper, 'jsonToUser').mockReturnValue(user);
      jest.spyOn(tokenService, 'generateAccessToken').mockReturnValue('TOKEN');
      jest.spyOn(tokenService, 'generateRefreshToken').mockReturnValue('TOKEN');
      jest.spyOn(user.password, 'comparePassword').mockReturnValue(true);
    });

    it('should use case call with correct parameters and create user session', async () => {
      const response = await useCase.execute(userLogin);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        email: userLogin.email.getValue(),
      });
      expect(user.password.comparePassword).toHaveBeenCalledWith(
        userLogin.password.getValue(),
      );
      expect(tokenService.generateAccessToken).toHaveBeenCalledWith({
        email: userJSON.email,
        userID: userJSON.userID,
        roles: userJSON.roles,
      });

      expect(tokenService.generateRefreshToken).toHaveBeenCalledWith(
        IDConstants.EXEMPLE,
      );
      expect(response).toEqual({
        accessToken: 'Bearer TOKEN',
        refreshToken: 'Bearer TOKEN',
        type: 'Bearer',
      });
    });

    it('should throw WrongCredentials exception when user does not exists', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      await expect(useCase.execute(userLogin)).rejects.toThrow(
        new WrongCredentials(),
      );
    });

    it('should throw WrongCredentials if password is incorrect', async () => {
      jest.spyOn(user.password, 'comparePassword').mockReturnValue(false);

      await expect(useCase.execute(userLogin)).rejects.toThrow(
        new WrongCredentials(),
      );
    });
  });
});
