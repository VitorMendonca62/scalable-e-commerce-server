import {
  GoogleUserFactory,
  LoginUserFactory,
  UserFactory,
} from '@auth/infrastructure/helpers/tests/user-factory';
import IDConstants from '@auth/domain/values-objects/id/id-constants';

import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';

import { CreateSessionUseCase } from './create-session.usecase';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';
import { AccountsProvider } from '@auth/domain/types/accounts-provider';
import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import { ProviderSessionRegistry } from '../strategies/provider-session.registry';
import { ProviderSessionStrategy } from '../strategies/provider-session.strategy';

describe('CreateSessionUseCase', () => {
  let useCase: CreateSessionUseCase;

  let userRepository: UserRepository;
  let tokenService: TokenService;
  let tokenRepository: TokenRepository;
  let passwordHasher: PasswordHasher;
  let providerSessionRegistry: ProviderSessionRegistry;
  let providerSessionStrategy: ProviderSessionStrategy;

  beforeEach(async () => {
    userRepository = {
      findSessionUserByEmail: vi.fn(),
      createGoogleUser: vi.fn(),
      updateAccountProvider: vi.fn(),
    } as any;

    tokenService = {
      generateAccessToken: vi.fn(),
      generateRefreshToken: vi.fn(),
    } as any;

    tokenRepository = {
      saveSession: vi.fn(),
    } as any;

    passwordHasher = {
      compare: vi.fn(),
    } as any;

    providerSessionStrategy = {
      provider: AccountsProvider.GOOGLE,
      execute: vi.fn(),
    } as any;

    providerSessionRegistry = {
      get: vi.fn().mockReturnValue(providerSessionStrategy),
    } as any;

    useCase = new CreateSessionUseCase(
      userRepository,
      tokenRepository,
      tokenService,
      passwordHasher,
      providerSessionRegistry,
    );
  });

  const sessionUser = UserFactory.createSessionUser();

  const generateAccessAndRefreshTokenResult = {
    accessToken: 'TOKEN',
    refreshToken: 'TOKEN',
  };

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(tokenRepository).toBeDefined();
    expect(tokenService).toBeDefined();
    expect(passwordHasher).toBeDefined();
  });

  describe('execute', () => {
    const loginUserEntity = LoginUserFactory.createEntity();

    beforeEach(() => {
      vi.spyOn(userRepository, 'findSessionUserByEmail').mockResolvedValue(
        sessionUser,
      );
      vi.spyOn(passwordHasher, 'compare').mockResolvedValue(true);

      vi.spyOn(
        useCase as any,
        'generateAccessAndRefreshToken',
      ).mockResolvedValue(generateAccessAndRefreshTokenResult);
    });

    it('should use case call functions with correct parameters', async () => {
      await useCase.execute(loginUserEntity);

      expect(userRepository.findSessionUserByEmail).toHaveBeenCalledWith(
        loginUserEntity.email.getValue(),
      );

      expect(passwordHasher.compare).toHaveBeenCalledWith(
        loginUserEntity.password.getValue(),
        sessionUser.password,
      );

      expect(
        (useCase as any).generateAccessAndRefreshToken,
      ).toHaveBeenCalledWith(
        sessionUser,
        loginUserEntity.ip,
        loginUserEntity.userAgent,
      );
    });

    it('should return what generateAccessAndRefreshToken returns', async () => {
      const result = await useCase.execute(loginUserEntity);

      expect(result).toEqual({
        ok: true,
        result: generateAccessAndRefreshTokenResult,
      });
    });

    it('should return WRONG_CREDENTIALS reason and ok false  when user does not exists', async () => {
      vi.spyOn(userRepository, 'findSessionUserByEmail').mockResolvedValue(
        null,
      );

      const result = await useCase.execute(loginUserEntity);
      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.WRONG_CREDENTIALS,
        message: 'Suas credenciais estão incorretas. Tente novamente',
      });
    });

    it('should return WrongCredentials reason and ok is false if password is incorrect', async () => {
      vi.spyOn(passwordHasher, 'compare').mockResolvedValue(false);

      const result = await useCase.execute(loginUserEntity);
      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.WRONG_CREDENTIALS,
        message: 'Suas credenciais estão incorretas. Tente novamente',
      });
    });

    it('should return WrongCredentials reason and ok is false if password is undefined', async () => {
      vi.spyOn(userRepository, 'findSessionUserByEmail').mockResolvedValue({
        ...sessionUser,
        password: undefined,
      });

      const result = await useCase.execute(loginUserEntity);
      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.WRONG_CREDENTIALS,
        message: 'Suas credenciais estão incorretas. Tente novamente',
      });
    });

    it('should return NOT_POSSIBLE when repository throws error', async () => {
      vi.spyOn(userRepository, 'findSessionUserByEmail').mockRejectedValue(
        new Error('Error finding user'),
      );

      const result = await useCase.execute(loginUserEntity);

      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro inesperado. Tente novamente mais tarde.',
      });
    });
  });

  describe('executeWithGoogle', () => {
    const googleSessionUser = UserFactory.createSessionUser();
    const userGoogleLogin = GoogleUserFactory.createEntity();

    beforeEach(() => {
      vi.spyOn(providerSessionStrategy, 'execute').mockResolvedValue({
        baseUser: googleSessionUser,
        newUser: undefined,
      });

      vi.spyOn(
        useCase as any,
        'generateAccessAndRefreshToken',
      ).mockResolvedValue(generateAccessAndRefreshTokenResult);
    });

    it('should resolve provider strategy and return tokens', async () => {
      const result = await useCase.executeWithGoogle(userGoogleLogin);

      expect(providerSessionRegistry.get).toHaveBeenCalledWith(
        AccountsProvider.GOOGLE,
      );
      expect(providerSessionStrategy.execute).toHaveBeenCalledWith(
        userGoogleLogin,
      );
      if (result.ok) {
        expect(result.result.tokens).toEqual(
          generateAccessAndRefreshTokenResult,
        );
        expect(result.result.newUser).toBeUndefined();
      }
    });

    it('should return NOT_POSSIBLE when provider throws error', async () => {
      vi.spyOn(providerSessionStrategy, 'execute').mockRejectedValue(
        new Error('Error in provider'),
      );

      const result = await useCase.executeWithGoogle(userGoogleLogin);

      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro inesperado. Tente novamente mais tarde.',
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
        sessionUser,
        ip,
      );

      expect(result).toEqual({
        accessToken: 'TOKEN',
        refreshToken: 'TOKEN',
      });
    });

    it('should call all functions with correct parameters', async () => {
      await (useCase as any).generateAccessAndRefreshToken(
        sessionUser,
        ip,
        'agent',
      );

      expect(tokenService.generateAccessToken).toHaveBeenCalledWith({
        email: sessionUser.email,
        userID: sessionUser.userID,
        roles: sessionUser.roles,
      });
      expect(tokenService.generateRefreshToken).toHaveBeenCalledWith(
        IDConstants.EXEMPLE,
      );
      expect(tokenRepository.saveSession).toHaveBeenCalledWith(
        IDConstants.EXEMPLE,
        IDConstants.EXEMPLE,
        ip,
        'agent',
      );
    });
  });
});
