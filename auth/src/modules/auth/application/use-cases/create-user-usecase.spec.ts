import { UserRepository } from '@modules/auth/domain/ports/secondary/user-repository.port';
import EmailVO from '@modules/auth/domain/values-objects/email.vo';
import { InMemoryUserRepository } from '@modules/auth/infrastructure/adaptars/secondary/database/repositories/inmemory-user.repository';
import { mockUser } from '@modules/auth/infrastructure/helpers/tests.helper';
import { BadRequestException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TestingModule, Test } from '@nestjs/testing';
import { CreateUserUseCase } from './create-user.usecase';

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
        .spyOn(userRepository, 'findByUsername')
        .mockImplementation(async () => undefined);
      jest
        .spyOn(userRepository, 'findByEmail')
        .mockImplementation(async () => undefined);

      jest.spyOn(userRepository, 'create').mockImplementation(() => undefined);
    });

    it('should use case call with correct parameters and create user', async () => {
      const response = await useCase.execute(user);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        user.email.getValue(),
      );
      expect(userRepository.findByUsername).toHaveBeenCalledWith(
        user.username.getValue(),
      );
      expect(userRepository.create).toHaveBeenCalledWith(user);
      expect(response).toBeUndefined();
    });

    it('should throw bad request exception when already exists user with newUser email', async () => {
      jest
        .spyOn(userRepository, 'findByEmail')
        .mockImplementation(async () => user);

      await expect(useCase.execute(user)).rejects.toThrow(
        new BadRequestException(EmailVO.ERROR_ALREADY_EXISTS),
      );
    });

    it('should throw bad request exception when already exists user with newUser username', async () => {
      jest
        .spyOn(userRepository, 'findByUsername')
        .mockImplementation(async () => user);

      await expect(useCase.execute(user)).rejects.toThrow(
        new BadRequestException(
          'Esse username já está sendo utilizado. Tente outro',
        ),
      );
    });
  });
});
