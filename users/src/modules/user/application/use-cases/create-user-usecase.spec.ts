import { FieldAlreadyExists } from '@user/domain/ports/primary/http/error.port';
import { UserRepository } from '@user/domain/ports/secondary/user-repository.port';
import { EmailConstants } from '@user/domain/values-objects/user/email/email-constants';
import { UsernameConstants } from '@user/domain/values-objects/user/username/username-constants';
import {
  mockUser,
  mockUserEntity,
} from '@user/infrastructure/helpers/tests.helper';
import { UserMapper } from '@user/infrastructure/mappers/user.mapper';
import { CreateUserUseCase } from './create-user.usecase';

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
      userToJSON: jest.fn(),
    } as any;

    useCase = new CreateUserUseCase(userRepository, userMapper);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(userMapper).toBeDefined();
  });

  describe('execute', () => {
    const user = mockUser();
    const userEntity = mockUserEntity();

    beforeEach(() => {
      jest.spyOn(userRepository, 'findOne').mockReturnValue(undefined);

      jest.spyOn(userRepository, 'create').mockReturnValue(undefined);

      jest.spyOn(userMapper, 'userToJSON').mockReturnValue(mockUserEntity());
    });

    it('should call repository with correct parameters ', async () => {
      await useCase.execute(user);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        username: `${user.username}`,
      });

      expect(userRepository.findOne).toHaveBeenCalledWith({
        email: `${user.email}`,
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
