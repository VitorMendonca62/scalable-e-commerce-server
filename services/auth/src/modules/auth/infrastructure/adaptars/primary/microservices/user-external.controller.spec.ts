import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import UserExternalController from './user.external.controller';
import { IDConstants } from '@auth/domain/values-objects/constants';

describe('UserExternalController', () => {
  let controller: UserExternalController;
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = {
      delete: vi.fn(),
      update: vi.fn(),
    } as any;

    controller = new UserExternalController(userRepository);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  describe('deleteUser', () => {
    it('should call userRepository.delete with correct parameters', async () => {
      const deletedAt = `${new Date().getTime()}`;

      await controller.deleteUser({ userID: IDConstants.EXEMPLE, deletedAt });

      expect(userRepository.delete).toHaveBeenCalledWith(
        IDConstants.EXEMPLE,
        new Date(deletedAt),
      );
    });
  });

  describe('updateUser', () => {
    it('should call userRepository.update with correct parameters', async () => {
      const updatedAt = `${new Date().getTime()}`;

      await controller.updateUser({ userID: IDConstants.EXEMPLE, updatedAt });

      expect(userRepository.update).toHaveBeenCalledWith(IDConstants.EXEMPLE, {
        updatedAt: new Date(updatedAt),
      });
    });
  });
});
