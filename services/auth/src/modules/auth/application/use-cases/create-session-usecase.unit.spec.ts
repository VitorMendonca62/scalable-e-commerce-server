jest.mock('uuid', () => {
  return { __esModule: true, v7: jest.fn() };
});

// Mocks
import {
  mockUser,
  mockUserModel,
  mockLoginUser,
  mockGoogleLogin,
} from '@auth/infrastructure/helpers/tests/user-mocks';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';

// Dependences
import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import { UserMapper } from '@auth/infrastructure/mappers/user.mapper';

// Ports
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';

// Function
import { CreateSessionUseCase } from './create-session.usecase';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';
import { defaultGoogleRoles } from '@auth/domain/constants/roles';
import { AccountsProvider } from '@auth/domain/types/accounts-provider';
import { v7 } from 'uuid';

describe('CreateSessionUseCase', () => {
  let useCase: CreateSessionUseCase;

  let userRepository: UserRepository;
  let tokenService: TokenService;
  let userMapper: UserMapper;
  let tokenRepository: TokenRepository;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    } as any;

    tokenService = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
    } as any;

    userMapper = {
      jsonToUser: jest.fn(),
      googleUserCreateForJSON: jest.fn(),
    } as any;

    tokenRepository = {
      saveSession: jest.fn(),
    } as any;

    useCase = new CreateSessionUseCase(
      userRepository,
      tokenRepository,
      tokenService,
      userMapper,
    );
  });

  const userModel = mockUserModel();

  const generateAccessAndRefreshTokenResult = {
    accessToken: 'TOKEN',
    refreshToken: 'TOKEN',
  };

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(tokenRepository).toBeDefined();
    expect(tokenService).toBeDefined();
    expect(userMapper).toBeDefined();
  });

  describe('execute', () => {
    const user = mockUser();
    const userLogin = mockLoginUser();

    beforeEach(() => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userModel);
      jest.spyOn(userMapper, 'jsonToUser').mockReturnValue(user);
      jest.spyOn(user.password, 'comparePassword').mockReturnValue(true);

      jest
        .spyOn(useCase as any, 'generateAccessAndRefreshToken')
        .mockResolvedValue(generateAccessAndRefreshTokenResult);
    });

    it('should use case call functions with correct parameters', async () => {
      await useCase.execute(userLogin);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        email: userLogin.email.getValue(),
      });

      expect(userMapper.jsonToUser).toHaveBeenCalledWith(userModel);

      expect(user.password.comparePassword).toHaveBeenCalledWith(
        userLogin.password.getValue(),
      );

      expect(
        (useCase as any).generateAccessAndRefreshToken,
      ).toHaveBeenCalledWith(userModel, userLogin.ip);
    });

    it('should return what generateAccessAndRefreshToken returns', async () => {
      const result = await useCase.execute(userLogin);

      expect(result).toEqual(generateAccessAndRefreshTokenResult);
    });

    it('should throw WrongCredentials exception when user does not exists', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      try {
        await useCase.execute(userLogin);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(WrongCredentials);
        expect(error.message).toBe(
          'Suas credenciais estão incorretas. Tente novamente',
        );
        expect(error.data).toBeUndefined();
      }
    });

    it('should throw WrongCredentials if password is incorrect', async () => {
      jest.spyOn(user.password, 'comparePassword').mockReturnValue(false);

      try {
        await useCase.execute(userLogin);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(WrongCredentials);
        expect(error.message).toBe(
          'Suas credenciais estão incorretas. Tente novamente',
        );
        expect(error.data).toBeUndefined();
      }
    });

    it('should throw WrongCredentials if user is not active', async () => {
      jest
        .spyOn(userMapper, 'jsonToUser')
        .mockReturnValue({ ...user, active: false });

      try {
        await useCase.execute(userLogin);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(WrongCredentials);
        expect(error.message).toBe(
          'Suas credenciais estão incorretas. Tente novamente',
        );
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('executeWithGoogle', () => {
    const googleUser = mockUserModel({
      password: undefined,
      phoneNumber: undefined,
      roles: defaultGoogleRoles,
      accountProvider: AccountsProvider.GOOGLE,
      accountProviderID: `google-${IDConstants.EXEMPLE}`,
    });
    const userGoogleLogin = mockGoogleLogin();
    const defautlUser = mockUserModel();

    beforeEach(() => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(defautlUser);
      jest.spyOn(userRepository, 'create').mockResolvedValue(undefined);
      jest.spyOn(userRepository, 'update').mockResolvedValue(undefined);
      jest
        .spyOn(userMapper, 'googleUserCreateForJSON')
        .mockReturnValue(googleUser);

      jest
        .spyOn(useCase as any, 'generateAccessAndRefreshToken')
        .mockResolvedValue(generateAccessAndRefreshTokenResult);

      (v7 as jest.Mock).mockReturnValue(IDConstants.EXEMPLE);
    });

    describe('is not new user', () => {
      it('should use case call functions with correct parameters', async () => {
        await useCase.executeWithGoogle(userGoogleLogin);

        expect(userRepository.findOne).toHaveBeenCalledWith({
          email: userGoogleLogin.email.getValue(),
        });

        expect(userRepository.update).toHaveBeenCalledWith(userModel.userID, {
          accountProvider: AccountsProvider.GOOGLE,
          accountProviderID: userGoogleLogin.id,
        });

        expect(
          (useCase as any).generateAccessAndRefreshToken,
        ).toHaveBeenCalledWith(userModel, userGoogleLogin.ip);
      });

      it('should no call userRepository.update when account provider not is default', async () => {
        jest.spyOn(userRepository, 'findOne').mockResolvedValue({
          ...defautlUser,
          accountProvider: AccountsProvider.GOOGLE,
          accountProviderID: `google-${IDConstants.EXEMPLE}`,
        });

        await useCase.executeWithGoogle(userGoogleLogin);

        expect(userRepository.update).not.toHaveBeenCalledWith();
      });

      it('should return accessToken and refreshToken in result and newUser undefined', async () => {
        const result = await useCase.executeWithGoogle(userGoogleLogin);

        expect(result.result).toEqual(generateAccessAndRefreshTokenResult);
        expect(result.newUser).toBeUndefined();
      });

      it('should throw WrongCredentials if user is not active', async () => {
        jest
          .spyOn(userRepository, 'findOne')
          .mockResolvedValue({ ...defautlUser, active: false });

        try {
          await useCase.executeWithGoogle(userGoogleLogin);
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error).toBeInstanceOf(WrongCredentials);
          expect(error.message).toBe(
            'Suas credenciais estão incorretas. Tente novamente',
          );
          expect(error.data).toBeUndefined();
        }
      });
    });

    describe('is new user', () => {
      beforeEach(() => {
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);
        jest.spyOn(userRepository, 'create').mockResolvedValue(googleUser);
      });

      it('should use case call functions with correct parameters', async () => {
        await useCase.executeWithGoogle(userGoogleLogin);

        expect(userRepository.findOne).toHaveBeenCalledWith({
          email: userGoogleLogin.email.getValue(),
        });

        expect(userMapper.googleUserCreateForJSON).toHaveBeenCalledWith(
          userGoogleLogin,
          IDConstants.EXEMPLE,
        );

        expect(userRepository.create).toHaveBeenCalledWith(googleUser);

        expect(userRepository.update).not.toHaveBeenCalled();

        expect(
          (useCase as any).generateAccessAndRefreshToken,
        ).toHaveBeenCalledWith(googleUser, userGoogleLogin.ip);
      });

      it('should return accessToken and refreshToken in result and newUser', async () => {
        const result = await useCase.executeWithGoogle(userGoogleLogin);

        expect(result.result).toEqual(generateAccessAndRefreshTokenResult);
        expect(result.newUser).toEqual(googleUser);
      });
    });
  });

  describe('generateAccessAndRefreshToken', () => {
    beforeEach(() => {
      jest.spyOn(tokenService, 'generateAccessToken').mockReturnValue('TOKEN');
      jest.spyOn(tokenService, 'generateRefreshToken').mockReturnValue({
        refreshToken: 'TOKEN',
        tokenID: IDConstants.EXEMPLE,
      });
    });

    const ip = '122.0.0.0';

    it('should return accessToken and refreshToken on sucess', async () => {
      const result = await (useCase as any).generateAccessAndRefreshToken(
        userModel,
        ip,
      );

      expect(result).toEqual({
        accessToken: 'TOKEN',
        refreshToken: 'TOKEN',
      });
    });

    it('should call all functions with correct parameters', async () => {
      await (useCase as any).generateAccessAndRefreshToken(userModel, ip);

      expect(tokenService.generateAccessToken).toHaveBeenCalledWith({
        email: userModel.email,
        userID: userModel.userID,
        roles: userModel.roles,
      });
      expect(tokenService.generateRefreshToken).toHaveBeenCalledWith(
        IDConstants.EXEMPLE,
      );
      expect(tokenRepository.saveSession).toHaveBeenCalledWith(
        IDConstants.EXEMPLE,
        IDConstants.EXEMPLE,
        ip,
      );
    });
  });
});
