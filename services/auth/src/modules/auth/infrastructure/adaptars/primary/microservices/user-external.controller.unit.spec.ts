import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import UserExternalController from './user.external.controller';
import {
  EmailConstants,
  IDConstants,
  PasswordConstants,
} from '@auth/domain/values-objects/constants';
import { UserFactory } from '@auth/infrastructure/helpers/tests/user-factory';
import { CreateExternalUserDTO } from './dtos/create-user.dto';
import { defaultRoles } from '@auth/domain/constants/roles';
import { UserMapper } from '@auth/infrastructure/mappers/user.mapper';

describe('UserExternalController', () => {
  let controller: UserExternalController;
  let userRepository: UserRepository;
  let userMapper: UserMapper;

  beforeEach(() => {
    userRepository = {
      delete: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    } as any;

    userMapper = {
      externalUserForModel: vi.fn(),
    } as any;

    controller = new UserExternalController(userRepository, userMapper);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(userMapper).toBeDefined();
  });

  describe('deleteUser', () => {
    it('should call userRepository.delete with correct parameters', async () => {
      const deletedAt = `${new Date()}`;

      await controller.deleteUser({ userID: IDConstants.EXEMPLE, deletedAt });

      expect(userRepository.delete).toHaveBeenCalledWith(
        IDConstants.EXEMPLE,
        new Date(deletedAt),
      );
    });
  });

  describe('updateUser', () => {
    it('should call userRepository.update with correct parameters', async () => {
      const updatedAt = `${new Date()}`;

      await controller.updateUser({ userID: IDConstants.EXEMPLE, updatedAt });

      expect(userRepository.update).toHaveBeenCalledWith(IDConstants.EXEMPLE, {
        updatedAt: new Date(updatedAt),
      });
    });
  });

  describe('createUser', () => {
    const payload: CreateExternalUserDTO = {
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString(),
      email: EmailConstants.EXEMPLE,
      password: PasswordConstants.EXEMPLE,
      roles: defaultRoles,
      userID: IDConstants.EXEMPLE,
    };

    beforeEach(() => {
      vi.spyOn(userMapper, 'externalUserForModel').mockReturnValue(
        UserFactory.createModel(),
      );
    });

    it('should call userRepository.create with correct parameters', async () => {
      await controller.createUser(payload);

      expect(userRepository.create).toHaveBeenCalledWith(
        UserFactory.createModel(),
      );
    });

    it('should call userMapper.externalUserForModel with correct parameters', async () => {
      await controller.createUser(payload);

      expect(userMapper.externalUserForModel).toHaveBeenCalledWith(payload);
    });
  });
});
