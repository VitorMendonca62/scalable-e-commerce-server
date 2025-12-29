import { mockValueObjects } from '@auth/infrastructure/helpers/tests/values-objects-mock';
mockValueObjects(['password']);

import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { PasswordConstants } from '@auth/domain/values-objects/password/password-constants';
import { mockUserLikeJSON } from '@auth/infrastructure/helpers/tests/user-helper';
import PasswordVO from '@auth/domain/values-objects/password/password-vo';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import { ResetPasswordUseCase } from './reset-password.usecase';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;

  let userRepository: UserRepository;
  let tokenRepository: TokenRepository;
  let passwordHasher: PasswordHasher;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
    } as any;

    tokenRepository = {
      revokeAllSessions: jest.fn(),
    } as any;

    passwordHasher = {} as any;

    useCase = new ResetPasswordUseCase(
      userRepository,
      passwordHasher,
      tokenRepository,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(tokenRepository).toBeDefined();
    expect(passwordHasher).toBeDefined();
  });

  describe('execute', () => {
    const email = EmailConstants.EXEMPLE;
    const user = mockUserLikeJSON();
    const newPassword = `new-${PasswordConstants.EXEMPLE}`;

    beforeEach(() => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      (PasswordVO.prototype.getValue as jest.Mock).mockReturnValue(newPassword);
    });

    it('should use case call functions with correct parameters', async () => {
      await useCase.execute(email, newPassword);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        email,
      });
      expect(PasswordVO).toHaveBeenCalledWith(
        newPassword,
        true,
        passwordHasher,
      );
      expect(userRepository.update).toHaveBeenCalledWith(user.userID, {
        password: newPassword,
      });

      expect(tokenRepository.revokeAllSessions).toHaveBeenCalledWith(
        user.userID,
      );
    });

    it('should throw bad request exception when user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      try {
        await useCase.execute(email, newPassword);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(WrongCredentials);
        expect(error.message).toBe('Token inválido ou expirado');
        expect(error.data).toBeUndefined();
      }
    });

    it('should rethrow error if PasswordVO throw error', async () => {
      (PasswordVO as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Error PasswordVO');
      });

      try {
        await useCase.execute(email, newPassword);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error PasswordVO');
        expect(error.data).toBeUndefined();
      }
    });

    it('should rethrow error if userRepository.find throw error', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockRejectedValue(new Error('Error finding code row'));
      try {
        await useCase.execute(email, newPassword);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error finding code row');
        expect(error.data).toBeUndefined();
      }
    });

    it('should rethrow error if userRepository.update throw error', async () => {
      jest
        .spyOn(userRepository, 'update')
        .mockRejectedValue(new Error('Error updating code'));

      try {
        await useCase.execute(email, newPassword);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error updating code');
        expect(error.data).toBeUndefined();
      }
    });
  });
});
