import { mockValueObjects } from '@auth/infrastructure/helpers/tests/values-objects-mock';
mockValueObjects(['hashedPassword', 'password']);
import {
  NotFoundUser,
  WrongCredentials,
} from '@auth/domain/ports/primary/http/errors.port';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';
import { PasswordHashedConstants } from '@auth/domain/values-objects/password-hashed/password-hashed-constants';
import PasswordHashedVO from '@auth/domain/values-objects/password-hashed/password-hashed-vo';
import { PasswordConstants } from '@auth/domain/values-objects/password/password-constants';
import PasswordVO from '@auth/domain/values-objects/password/password-vo';
import { UpdatePasswordUseCase } from './update-password-usecase';
import { mockUserLikeJSON } from '@auth/infrastructure/helpers/tests/user-helper';

describe('UpdatePasswordUseCase', () => {
  let useCase: UpdatePasswordUseCase;

  let userRepository: UserRepository;
  let passwordHasher: PasswordHasher;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
    } as any;

    passwordHasher = {} as any;

    useCase = new UpdatePasswordUseCase(userRepository, passwordHasher);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(passwordHasher).toBeDefined();
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
    });

    it('should throw NotFoundUser when user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      await expect(
        useCase.execute(userID, newPassword, oldPassword),
      ).rejects.toThrow(new NotFoundUser());
    });

    it('should rethrow error if PasswordHashedVO throw error', async () => {
      (PasswordHashedVO as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Error PasswordHashedVO');
      });

      expect(useCase.execute(userID, newPassword, oldPassword)).rejects.toThrow(
        new Error('Error PasswordHashedVO'),
      );
    });

    it('should throw WrongCredentials if oldPassword is incorrect', async () => {
      jest
        .spyOn(PasswordHashedVO.prototype, 'comparePassword')
        .mockReturnValue(false);

      expect(useCase.execute(userID, newPassword, oldPassword)).rejects.toThrow(
        new WrongCredentials('A senha atual informada está incorreta.'),
      );
    });

    it('should rethrow error if PasswordVO throw error', async () => {
      (PasswordVO as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Error PasswordVO');
      });

      expect(useCase.execute(userID, newPassword, oldPassword)).rejects.toThrow(
        new Error('Error PasswordVO'),
      );
    });

    it('should rethrow error if userRepository.find throw error', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockRejectedValue(new Error('Error finding code row'));

      expect(useCase.execute(userID, newPassword, oldPassword)).rejects.toThrow(
        new Error('Error finding code row'),
      );
    });

    it('should rethrow error if userRepository.update throw error', async () => {
      jest
        .spyOn(userRepository, 'update')
        .mockRejectedValue(new Error('Error updating code'));

      expect(useCase.execute(userID, newPassword, oldPassword)).rejects.toThrow(
        new Error('Error updating code'),
      );
    });
  });
});
