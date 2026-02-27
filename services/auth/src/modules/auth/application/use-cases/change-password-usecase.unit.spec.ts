import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import IDConstants from '@auth/domain/values-objects/id/id-constants';
import { ChangePasswordUseCase } from './change-password.usecase';
import { UserFactory } from '@auth/infrastructure/helpers/tests/user-factory';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';
import {
  EmailConstants,
  PasswordConstants,
  PasswordHashedConstants,
} from '@auth/domain/values-objects/constants';
import {
  MockHashedPassword,
  mockPasswordCreate,
  mockPasswordHashedCompare,
  mockPasswordHashedConstructor,
  mockPasswordHashedGetValue,
} from '@auth/infrastructure/helpers/tests/values-objects-mock';
import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';
import { PasswordHasherFactory } from '@auth/infrastructure/helpers/tests/password-factory';

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;

  let userRepository: UserRepository;
  let passwordHasher: PasswordHasher;
  let tokenRepository: TokenRepository;

  beforeEach(async () => {
    mockPasswordHashedGetValue.mockReturnValue(PasswordHashedConstants.EXEMPLE);
    mockPasswordCreate.mockResolvedValue(
      new MockHashedPassword(
        PasswordHashedConstants.EXEMPLE,
        new PasswordHasherFactory().default(),
      ),
    );

    userRepository = {
      findOne: vi.fn(),
      update: vi.fn(),
    } as any;

    passwordHasher = {} as any;
    tokenRepository = {
      revokeAllSessions: vi.fn(),
    } as any;

    useCase = new ChangePasswordUseCase(
      userRepository,
      passwordHasher,
      tokenRepository,
    );
  });

  const userID = IDConstants.EXEMPLE;
  const newPassword = `new-${PasswordConstants.EXEMPLE}`;
  const user = UserFactory.createModel();

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(passwordHasher).toBeDefined();
    expect(tokenRepository).toBeDefined();
  });

  describe('executeUpdate', () => {
    const oldPassword = `old-${PasswordConstants.EXEMPLE}`;

    beforeEach(() => {
      vi.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      mockPasswordHashedGetValue.mockReturnValue(
        PasswordHashedConstants.EXEMPLE,
      );
      mockPasswordHashedCompare.mockReturnValue(true);
      vi.spyOn(useCase as any, 'updatePassword');
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    it('should use case call functions with correct parameters', async () => {
      await useCase.executeUpdate(userID, newPassword, oldPassword);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        userID,
      });
      expect(mockPasswordHashedConstructor).toHaveBeenCalledWith(
        user.password,
        passwordHasher,
      );
      expect(mockPasswordHashedCompare).toHaveBeenCalledWith(oldPassword);
      expect((useCase as any).updatePassword).toBeCalledWith(
        user.userID,
        newPassword,
      );
    });

    it('should return token and ok on sucess', async () => {
      const result = await useCase.executeUpdate(
        userID,
        newPassword,
        oldPassword,
      );

      expect(result).toEqual({
        ok: true,
      });
    });

    it('should return ok false and NotFoundUser reason when user does not exist', async () => {
      vi.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      const result = await useCase.executeUpdate(
        userID,
        newPassword,
        oldPassword,
      );
      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
      });
    });

    it('should return FieldInvalid reason and ok false if oldPassword is incorrect', async () => {
      mockPasswordHashedCompare.mockReturnValue(false);

      const result = await useCase.executeUpdate(
        userID,
        newPassword,
        oldPassword,
      );
      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.FIELD_INVALID,
        message: 'A senha atual informada está incorreta.',
        result: 'oldPassword',
      });
    });

    it('should retrow error if this.updatePassword throw error', async () => {
      vi.spyOn(useCase as any, 'updatePassword').mockRejectedValue(
        new Error('Error in updatePassword'),
      );

      try {
        await useCase.executeUpdate(userID, newPassword, oldPassword);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error in updatePassword');
      }
    });
  });

  describe('executeReset', () => {
    const email = EmailConstants.EXEMPLE;

    beforeEach(() => {
      vi.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      vi.spyOn(useCase as any, 'updatePassword');
    });

    it('should use case call functions with correct parameters', async () => {
      await useCase.executeReset(email, newPassword);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        email,
      });
      expect((useCase as any).updatePassword).toBeCalledWith(
        user.userID,
        newPassword,
      );
    });

    it('should return token and ok on sucess', async () => {
      const result = await useCase.executeReset(email, newPassword);

      expect(result).toEqual({
        ok: true,
      });
    });

    it('should return ok false and not found reason when user does not exist', async () => {
      vi.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      const result = await useCase.executeReset(email, newPassword);

      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Token inválido ou expirado',
      });
    });

    it('should rethrow error if userRepository.findOne throw error', async () => {
      vi.spyOn(userRepository, 'findOne').mockRejectedValue(
        new Error('Error finding code row'),
      );
      try {
        await useCase.executeReset(email, newPassword);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error finding code row');
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('updatePassword', () => {
    beforeEach(() => {
      vi.spyOn(userRepository, 'update');
      vi.spyOn(tokenRepository, 'revokeAllSessions');
    });

    it('should call functions with correct parameters', async () => {
      await (useCase as any).updatePassword(userID, newPassword);

      expect(mockPasswordCreate).toHaveBeenCalledWith(
        newPassword,
        passwordHasher,
      );
      expect(userRepository.update).toHaveBeenCalledWith(user.userID, {
        password: PasswordHashedConstants.EXEMPLE,
      });

      expect(tokenRepository.revokeAllSessions).toHaveBeenCalledWith(
        user.userID,
      );
    });

    it('should rethrow error if PasswordVO.createAndHash throw error', async () => {
      mockPasswordCreate.mockImplementationOnce(() => {
        throw new Error('Error PasswordVO');
      });

      try {
        await (useCase as any).updatePassword(userID, newPassword);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error PasswordVO');
        expect(error.data).toBeUndefined();
      }
    });

    it('should rethrow error if userRepository.update throw error', async () => {
      vi.spyOn(userRepository, 'update').mockRejectedValue(
        new Error('Error updating code'),
      );

      try {
        await (useCase as any).updatePassword(userID, newPassword);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error updating code');
        expect(error.data).toBeUndefined();
      }
    });

    it('should rethrow error if tokenRepository.revokeAllSessions throw error', async () => {
      vi.spyOn(tokenRepository, 'revokeAllSessions').mockRejectedValue(
        new Error('Error revoke sessions'),
      );

      try {
        await (useCase as any).updatePassword(userID, newPassword);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error revoke sessions');
        expect(error.data).toBeUndefined();
      }
    });
  });
});
