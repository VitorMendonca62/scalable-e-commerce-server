import { mockValueObjects } from '@auth/infrastructure/helpers/tests/values-objects-mock';
mockValueObjects(['hashedPassword', 'password']);
import {
  FieldInvalid,
  NotFoundUser,
} from '@auth/domain/ports/primary/http/errors.port';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';
import { PasswordHashedConstants } from '@auth/domain/values-objects/password-hashed/password-hashed-constants';
import PasswordHashedVO from '@auth/domain/values-objects/password-hashed/password-hashed-vo';
import { PasswordConstants } from '@auth/domain/values-objects/password/password-constants';
import PasswordVO from '@auth/domain/values-objects/password/password-vo';
import { UpdatePasswordUseCase } from './update-password-usecase';
import { mockUserLikeJSON } from '@auth/infrastructure/helpers/tests/user-mocks';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';

describe('UpdatePasswordUseCase', () => {
  let useCase: UpdatePasswordUseCase;

  let userRepository: UserRepository;
  let passwordHasher: PasswordHasher;
  let tokenRepository: TokenRepository;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
    } as any;

    passwordHasher = {} as any;
    tokenRepository = {
      revokeAllSessions: jest.fn(),
    } as any;

    useCase = new UpdatePasswordUseCase(
      userRepository,
      passwordHasher,
      tokenRepository,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(passwordHasher).toBeDefined();
    expect(tokenRepository).toBeDefined();
  });

  describe('execute', () => {
    const userID = IDConstants.EXEMPLE;
    const newPassword = `new-${PasswordConstants.EXEMPLE}`;
    const oldPassword = `old-${PasswordConstants.EXEMPLE}`;
    const user = mockUserLikeJSON();

    beforeEach(() => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      (PasswordVO.prototype.getValue as jest.Mock).mockReturnValue(newPassword);
      (PasswordHashedVO.prototype.getValue as jest.Mock).mockReturnValue(
        PasswordHashedConstants.EXEMPLE,
      );
      jest
        .spyOn(PasswordHashedVO.prototype, 'comparePassword')
        .mockReturnValue(true);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should use case call functions with correct parameters', async () => {
      await useCase.execute(userID, newPassword, oldPassword);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        userID,
      });
      expect(PasswordHashedVO).toHaveBeenCalledWith(
        user.password,
        passwordHasher,
      );
      expect(PasswordHashedVO.prototype.comparePassword).toHaveBeenCalledWith(
        oldPassword,
      );
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

    it('should throw NotFoundUser when user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      try {
        await useCase.execute(userID, newPassword, oldPassword);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(NotFoundUser);
        expect(error.message).toBe('Usuário não encontrado.');
        expect(error.data).toBeUndefined();
      }
    });

    it('should rethrow error if PasswordHashedVO throw error', async () => {
      (PasswordHashedVO as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Error PasswordHashedVO');
      });

      try {
        await useCase.execute(userID, newPassword, oldPassword);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error PasswordHashedVO');
        expect(error.data).toBeUndefined();
      }
    });

    it('should throw WrongCredentials if oldPassword is incorrect', async () => {
      jest
        .spyOn(PasswordHashedVO.prototype, 'comparePassword')
        .mockReturnValue(false);

      try {
        await useCase.execute(userID, newPassword, oldPassword);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(FieldInvalid);
        expect(error.message).toBe('A senha atual informada está incorreta.');
        expect(error.data).toBe('oldPassword');
      }
    });

    it('should rethrow error if PasswordVO throw error', async () => {
      (PasswordVO as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Error PasswordVO');
      });

      try {
        await useCase.execute(userID, newPassword, oldPassword);
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
        await useCase.execute(userID, newPassword, oldPassword);
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
        await useCase.execute(userID, newPassword, oldPassword);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error updating code');
        expect(error.data).toBeUndefined();
      }
    });
  });
});
