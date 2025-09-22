import { UserRepository } from '@modules/user/domain/ports/secondary/user-repository.port';
import {
  mockUser,
  mockUserEntity,
} from '@modules/user/infrastructure/helpers/tests.helper';
import { NotFoundException } from '@nestjs/common';
import { DeleteUserUseCase } from './delete-user.usecase';
import { IDConstants } from '@modules/user/domain/values-objects/uuid/id-constants';
import { NotFoundItem } from '@modules/user/domain/ports/primary/http/error.port';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let userRepository: UserRepository;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      delete: jest.fn(),
    } as any;

    useCase = new DeleteUserUseCase(userRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  describe('execute', () => {
    const user = mockUserEntity();
    const id = IDConstants.EXEMPLE;

    beforeEach(() => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(userRepository, 'delete').mockReturnValue(undefined);
    });

    it('should call repository with correct parameters ', async () => {
      await useCase.execute(id);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        userId: id,
      });

      expect(userRepository.delete).toHaveBeenCalledWith(id);
    });

    it('should return undefined on sucess', async () => {
      const response = await useCase.execute(id);

      expect(response).toBeUndefined();
    });

    it('should throw not found item when user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      await expect(useCase.execute(id)).rejects.toThrow(
        new NotFoundItem('Não foi possivel encontrar o usuário'),
      );
    });

    it('should throw not found item when user is not active', async () => {
      const user = mockUserEntity({ active: false });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      await expect(useCase.execute(id)).rejects.toThrow(
        new NotFoundItem('Não foi possivel encontrar o usuário'),
      );
    });
  });
});
