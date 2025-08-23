import { TokenService } from '@modules/auth/domain/ports/primary/session.port';
import { UserRepository } from '@modules/auth/domain/ports/secondary/user-repository.port';
import {
  mockUser,
  mockLoginUser,
  userLikeJSON,
} from '@modules/auth/infrastructure/helpers/tests/tests.helper';
import { CreateSessionUseCase } from './create-session.usecase';
import { WrongCredentials } from '@modules/auth/domain/ports/primary/http/errors.port';
import { UserMapper } from '@modules/auth/infrastructure/mappers/user.mapper';

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
    const user = mockUser({ _id: 'USERID' });
    const userEntity = userLikeJSON({ _id: 'USERID' });
    const userLogin = mockLoginUser();

    beforeEach(() => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userEntity);

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
      expect(tokenService.generateAccessToken).toHaveBeenCalledWith(userEntity);

      expect(tokenService.generateRefreshToken).toHaveBeenCalledWith('USERID');
      expect(response).toEqual({
        accessToken: 'Bearer TOKEN',
        refreshToken: 'Bearer TOKEN',
        type: 'Bearer',
      });
    });

    it('should throw bad request exception when user does not exists', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      await expect(useCase.execute(userLogin)).rejects.toThrow(
        new WrongCredentials(),
      );
    });

    it('should throw bad request exception when password is incorrect', async () => {
      jest.spyOn(user.password, 'comparePassword').mockReturnValue(false);

      await expect(useCase.execute(userLogin)).rejects.toThrow(
        new WrongCredentials(),
      );
    });
  });
});
