import { UserRepository } from '@modules/auth/domain/ports/secondary/user-repository.port';
import { InMemoryUserRepository } from '@modules/auth/infrastructure/adaptars/secondary/database/repositories/inmemory-user.repository';
import { mockUser } from '@modules/auth/infrastructure/helpers/tests.helper';
import { ConfigModule } from '@nestjs/config';
import { TestingModule, Test } from '@nestjs/testing';
import { CreateUserUseCase } from './create-user.usecase';
import { FieldlAlreadyExists } from '@modules/auth/domain/types/errors/errors';
import { EmailConstants } from '@modules/auth/domain/values-objects/email/EmailConstants';
import { UsernameConstants } from '@modules/auth/domain/values-objects/username/UsernameConstants';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        CreateUserUseCase,
        {
          provide: UserRepository,
          useClass: InMemoryUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  describe('execute', () => {
    const user = mockUser();

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
      expect(userRepository.create).toHaveBeenCalledWith(user);
      expect(response).toBeUndefined();
    });

    it('should throw bad request exception when already exists user with newUser email', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockImplementationOnce(async () => undefined)
        .mockImplementationOnce(async () => user);

      await expect(useCase.execute(user)).rejects.toThrow(
        new FieldlAlreadyExists(EmailConstants.ERROR_ALREADY_EXISTS, 'email'),
      );
    });

    it('should throw bad request exception when already exists user with User username', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockImplementationOnce(async () => user)
        .mockImplementationOnce(async () => undefined);

      await expect(useCase.execute(user)).rejects.toThrow(
        new FieldlAlreadyExists(
          UsernameConstants.ERROR_ALREADY_EXISTS,
          'username',
        ),
      );
    });
  });
});
