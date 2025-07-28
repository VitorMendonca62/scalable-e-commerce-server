import { UserRepository } from '@modules/auth/domain/ports/secondary/user-repository.port';
import {
  mockUser,
  userLikeJSON,
} from '@modules/auth/infrastructure/helpers/tests/tests.helper';
import { CreateUserUseCase } from './create-user.usecase';
import { FieldAlreadyExists } from '@modules/auth/domain/ports/primary/http/errors.port';
import { EmailConstants } from '@modules/auth/domain/values-objects/email/email-constants';
import { UsernameConstants } from '@modules/auth/domain/values-objects/username/username-constants';
import { UserMapper } from '@modules/auth/infrastructure/mappers/user.mapper';

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
    const userEntity = userLikeJSON();

    beforeEach(() => {
      jest.spyOn(userRepository, 'findOne').mockReturnValue(undefined);
      jest.spyOn(userRepository, 'findOne').mockReturnValue(undefined);

      jest.spyOn(userRepository, 'create').mockReturnValue(undefined);

      jest.spyOn(userMapper, 'userToJSON').mockReturnValue(userLikeJSON());
    });

    it('should use case call with correct parameters ', async () => {
      const response = await useCase.execute(user);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        email: user.email.getValue(),
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        username: user.username.getValue(),
      });

      expect(userRepository.create).toHaveBeenCalledWith(userEntity);
      expect(response).toBeUndefined();
    });

    it('should throw bad request exception when already exists user with new user email', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockReturnValueOnce(undefined)
        .mockResolvedValueOnce(userEntity);

      await expect(useCase.execute(user)).rejects.toThrow(
        new FieldAlreadyExists(EmailConstants.ERROR_ALREADY_EXISTS, 'email'),
      );
    });

    it('should throw bad request exception when already exists user with new user username', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce(userEntity)
        .mockReturnValueOnce(undefined);

      await expect(useCase.execute(user)).rejects.toThrow(
        new FieldAlreadyExists(
          UsernameConstants.ERROR_ALREADY_EXISTS,
          'username',
        ),
      );
    });
  });
});
