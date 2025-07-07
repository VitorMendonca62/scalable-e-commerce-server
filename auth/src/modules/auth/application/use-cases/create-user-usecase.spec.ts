import { UserRepository } from '@modules/auth/domain/ports/secondary/user-repository.port';
import { InMemoryUserRepository } from '@modules/auth/infrastructure/adaptars/secondary/database/repositories/inmemory-user.repository';
import {
  mockUser,
  userLikeJSON,
} from '@modules/auth/infrastructure/helpers/tests/tests.helper';
import { ConfigModule } from '@nestjs/config';
import { TestingModule, Test } from '@nestjs/testing';
import { CreateUserUseCase } from './create-user.usecase';
import { FieldAlreadyExists } from '@modules/auth/domain/ports/primary/http/errors.port';
import { EmailConstants } from '@modules/auth/domain/values-objects/email/EmailConstants';
import { UsernameConstants } from '@modules/auth/domain/values-objects/username/UsernameConstants';
import { UserMapper } from '@modules/auth/infrastructure/mappers/user.mapper';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: UserRepository;
  let userMapper: UserMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        CreateUserUseCase,
        {
          provide: UserRepository,
          useClass: InMemoryUserRepository,
        },
        UserMapper,
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
    userMapper = module.get<UserMapper>(UserMapper);
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
      jest
        .spyOn(userRepository, 'findOne')
        .mockImplementation(async () => undefined);
      jest
        .spyOn(userRepository, 'findOne')
        .mockImplementation(async () => undefined);

      jest.spyOn(userRepository, 'create').mockImplementation(() => undefined);
    });

    it('should use case call with correct parameters and create user', async () => {
      const response = await useCase.execute(user);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        email: user.email.getValue(),
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        username: user.username.getValue(),
      });
      userEntity.password = `${user.password}`;
      expect(userRepository.create).toHaveBeenCalledWith(userEntity);
      expect(response).toBeUndefined();
    });

    it('should throw bad request exception when already exists user with newUser email', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockImplementationOnce(async () => undefined)
        .mockImplementationOnce(async () => userEntity);

      await expect(useCase.execute(user)).rejects.toThrow(
        new FieldAlreadyExists(EmailConstants.ERROR_ALREADY_EXISTS, 'email'),
      );
    });

    it('should throw bad request exception when already exists user with User username', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockImplementationOnce(async () => userEntity)
        .mockImplementationOnce(async () => undefined);

      await expect(useCase.execute(user)).rejects.toThrow(
        new FieldAlreadyExists(
          UsernameConstants.ERROR_ALREADY_EXISTS,
          'username',
        ),
      );
    });
  });
});
