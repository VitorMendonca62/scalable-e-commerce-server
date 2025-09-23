import { FieldAlreadyExists } from '@user/domain/ports/primary/http/error.port';
import { UserRepository } from '@user/domain/ports/secondary/user-repository.port';

import { UserMapper } from '@user/infrastructure/mappers/user.mapper';
import { CreateUserUseCase } from './create-user.usecase';
import { UserFactory } from '@modules/user/infrastructure/helpers/users/user-factory';
import { EmailConstants, UsernameConstants } from '@modules/user/domain/values-objects/user/constants';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: UserRepository;
  let userMapper: UserMapper;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
    } as any;

    userMapper = {
      userModelToJSON: jest.fn(),
    } as any;

    useCase = new CreateUserUseCase(userRepository, userMapper);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(userMapper).toBeDefined();
  });

  describe('execute', () => {
    const user = UserFactory.createModel();
    const userEntity = UserFactory.createEntity();

    beforeEach(() => {
      jest.spyOn(userRepository, 'findOne').mockReturnValue(undefined);

      jest.spyOn(userRepository, 'create').mockReturnValue(undefined);

      jest.spyOn(userMapper, 'userModelToJSON').mockReturnValue(userEntity);
    });

    it('should call repository with correct parameters ', async () => {
      await useCase.execute(user);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        username: user.username.getValue(),
      });

      expect(userRepository.findOne).toHaveBeenCalledWith({
        email: user.email.getValue(),
      });

      expect(userRepository.create).toHaveBeenCalledWith(userEntity);
    });

    it('should return undefined on sucess', async () => {
      const response = await useCase.execute(user);

      expect(response).toBeUndefined();
    });

    it('should throw bad request exception when already exists user with new user email', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(userEntity);

      await expect(useCase.execute(user)).rejects.toThrow(
        new FieldAlreadyExists(EmailConstants.ERROR_ALREADY_EXISTS, 'email'),
      );
    });

    it('should throw bad request exception when already exists user with new user username', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce(userEntity)
        .mockResolvedValueOnce(undefined);

      await expect(useCase.execute(user)).rejects.toThrow(
        new FieldAlreadyExists(
          UsernameConstants.ERROR_ALREADY_EXISTS,
          'username',
        ),
      );
    });
  });
});
