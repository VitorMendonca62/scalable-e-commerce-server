vi.mock('uuid', () => {
  return { v7: vi.fn() };
});

import {
  GoogleUserFactory,
  LoginUserFactory,
  UserFactory,
} from '@auth/infrastructure/helpers/tests/user-factory';
import IDConstants from '@auth/domain/values-objects/id/id-constants';

import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import { UserMapper } from '@auth/infrastructure/mappers/user.mapper';

import { CreateSessionUseCase } from './create-session.usecase';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';
import { AccountsProvider } from '@auth/domain/types/accounts-provider';
import { v7 } from 'uuid';

import { type Mock } from 'vitest';
import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';

describe('CreateSessionUseCase', () => {
  let useCase: CreateSessionUseCase;

  let userRepository: UserRepository;
  let tokenService: TokenService;
  let userMapper: UserMapper;
  let tokenRepository: TokenRepository;

  beforeEach(async () => {
    userRepository = {
      findOne: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    } as any;

    tokenService = {
      generateAccessToken: vi.fn(),
      generateRefreshToken: vi.fn(),
    } as any;

    userMapper = {
      modelToEntity: vi.fn(),
      googleEntityForModel: vi.fn(),
    } as any;

    tokenRepository = {
      saveSession: vi.fn(),
    } as any;

    useCase = new CreateSessionUseCase(
      userRepository,
      tokenRepository,
      tokenService,
      userMapper,
    );
  });

  const userModel = UserFactory.createModel();

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
    const userEntity = UserFactory.createEntity();
    const loginUserEntity = LoginUserFactory.createEntity();

    beforeEach(() => {
      vi.spyOn(userRepository, 'findOne').mockResolvedValue(userModel);
      vi.spyOn(userMapper, 'modelToEntity').mockReturnValue(userEntity);
      vi.spyOn(userEntity.password, 'comparePassword').mockReturnValue(true);

      vi.spyOn(
        useCase as any,
        'generateAccessAndRefreshToken',
      ).mockResolvedValue(generateAccessAndRefreshTokenResult);
    });

    it('should use case call functions with correct parameters', async () => {
      await useCase.execute(loginUserEntity);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        email: loginUserEntity.email.getValue(),
      });

      expect(userMapper.modelToEntity).toHaveBeenCalledWith(userModel);

      expect(userEntity.password.comparePassword).toHaveBeenCalledWith(
        loginUserEntity.password.getValue(),
      );

      expect(
        (useCase as any).generateAccessAndRefreshToken,
      ).toHaveBeenCalledWith(userModel, loginUserEntity.ip);
    });

    it('should return what generateAccessAndRefreshToken returns', async () => {
      const result = await useCase.execute(loginUserEntity);

      expect(result).toEqual({
        ok: true,
        result: generateAccessAndRefreshTokenResult,
      });
    });

    it('should return not found reason and ok false  when user does not exists', async () => {
      vi.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      const result = await useCase.execute(loginUserEntity);
      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Suas credenciais estão incorretas. Tente novamente',
      });
    });

    it('should return WrongCredentials reason and ok is false if password is incorrect', async () => {
      vi.spyOn(userEntity.password, 'comparePassword').mockReturnValue(false);

      const result = await useCase.execute(loginUserEntity);
      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.WRONG_CREDENTIALS,
        message: 'Suas credenciais estão incorretas. Tente novamente',
      });
    });
  });

  describe('executeWithGoogle', () => {
    const googleUserModel = UserFactory.createModel();
    const defautlUserModel = UserFactory.createModel();
    const userGoogleLogin = GoogleUserFactory.createEntity();

    beforeEach(() => {
      vi.spyOn(userRepository, 'findOne').mockResolvedValue(defautlUserModel);
      vi.spyOn(userRepository, 'create').mockResolvedValue(undefined);
      vi.spyOn(userRepository, 'update').mockResolvedValue(undefined);
      vi.spyOn(userMapper, 'googleEntityForModel').mockReturnValue(
        googleUserModel,
      );

      vi.spyOn(
        useCase as any,
        'generateAccessAndRefreshToken',
      ).mockResolvedValue(generateAccessAndRefreshTokenResult);

      (v7 as Mock).mockReturnValue(IDConstants.EXEMPLE);
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
        vi.spyOn(userRepository, 'findOne').mockResolvedValue({
          ...defautlUserModel,
          accountProvider: AccountsProvider.GOOGLE,
          accountProviderID: `google-${IDConstants.EXEMPLE}`,
        });

        await useCase.executeWithGoogle(userGoogleLogin);

        expect(userRepository.update).not.toHaveBeenCalledWith();
      });

      it('should return accessToken and refreshToken in result and newUser undefined', async () => {
        const result = await useCase.executeWithGoogle(userGoogleLogin);

        expect(result.result.tokens).toEqual(
          generateAccessAndRefreshTokenResult,
        );
        expect(result.result.newUser).toBeUndefined();
      });
    });

    describe('is new user', () => {
      beforeEach(() => {
        vi.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);
        vi.spyOn(userRepository, 'create').mockResolvedValue(googleUserModel);
      });

      it('should use case call functions with correct parameters', async () => {
        await useCase.executeWithGoogle(userGoogleLogin);

        expect(userRepository.findOne).toHaveBeenCalledWith({
          email: userGoogleLogin.email.getValue(),
        });

        expect(userMapper.googleEntityForModel).toHaveBeenCalledWith(
          userGoogleLogin,
          IDConstants.EXEMPLE,
        );

        expect(userRepository.create).toHaveBeenCalledWith(googleUserModel);

        expect(userRepository.update).not.toHaveBeenCalled();

        expect(
          (useCase as any).generateAccessAndRefreshToken,
        ).toHaveBeenCalledWith(googleUserModel, userGoogleLogin.ip);
      });

      it('should return accessToken and refreshToken in result and newUser', async () => {
        const result = await useCase.executeWithGoogle(userGoogleLogin);

        expect(result.result.tokens).toEqual(
          generateAccessAndRefreshTokenResult,
        );
        expect(result.result.newUser).toEqual(googleUserModel);
      });
    });
  });

  describe('generateAccessAndRefreshToken', () => {
    beforeEach(() => {
      vi.spyOn(tokenService, 'generateAccessToken').mockReturnValue('TOKEN');
      vi.spyOn(tokenService, 'generateRefreshToken').mockReturnValue({
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
