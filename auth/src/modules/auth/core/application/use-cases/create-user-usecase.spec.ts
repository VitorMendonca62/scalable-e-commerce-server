import { TestingModule, Test } from '@nestjs/testing';
import { UserRepository } from '../ports/secondary/user-repository.interface';
import { CreateUserUseCase } from './create-user.usecase';
import { mockUser } from '@modules/auth/helpers/tests.helper';
import { InMemoryUserRepository } from '@modules/auth/adaptars/secondary/database/repositories/inmemory-user.repository';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
        .spyOn(userRepository, 'findByUsername')
        .mockImplementation(async () => undefined);
      jest
        .spyOn(userRepository, 'findByEmail')
        .mockImplementation(async () => undefined);

      jest.spyOn(userRepository, 'create').mockImplementation(() => undefined);
    });

    it('should use case call with correct parameters and create user', async () => {
      const response = await useCase.execute(user);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(user.email);
      expect(userRepository.findByUsername).toHaveBeenCalledWith(user.username);
      expect(userRepository.create).toHaveBeenCalledWith(user);
      expect(response).toBeUndefined();
    });

    it('should throw bad request exception when already exists user with newUser email', async () => {
      jest
        .spyOn(userRepository, 'findByEmail')
        .mockImplementation(async () => user);

      await expect(useCase.execute(user)).rejects.toThrow(
        'Esse email já está sendo utilizado. Tente outro',
      );
    });

    it('should throw bad request exception when already exists user with newUser username', async () => {
      jest
        .spyOn(userRepository, 'findByUsername')
        .mockImplementation(async () => user);

      await expect(useCase.execute(user)).rejects.toThrow(
        'Esse username já está sendo utilizado. Tente outro',
      );
    });
  });
});
