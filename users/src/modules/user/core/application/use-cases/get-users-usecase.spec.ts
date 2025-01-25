import { TestingModule, Test } from '@nestjs/testing';
import { UserRepository } from '../ports/secondary/user-repository.interface';
import { mockUserList } from '@modules/user/helpers/tests.helper';
import { InMemoryUserRepository } from '@user/adaptars/secondary/database/repositories/inmemory-user.repository';
import { ConfigModule } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { GetUsersUseCase } from './get-users.usecase';

describe('GetUsersUseCase', () => {
  let useCase: GetUsersUseCase;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        GetUsersUseCase,
        {
          provide: UserRepository,
          useClass: InMemoryUserRepository,
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    useCase = module.get<GetUsersUseCase>(GetUsersUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  describe('getAll', () => {
    const users = mockUserList();

    beforeEach(() => {
      jest
        .spyOn(userRepository, 'getAll')
        .mockImplementation(async () => users);
    });

    it('should use case call with correct parameters and return users', async () => {
      const response = await useCase.getAll();

      expect(userRepository.getAll).toHaveBeenCalledWith();
      expect(response).toBeInstanceOf(Array);
      expect(response).toEqual(users);
    });

    it('should throw not found execption when users does not exists', async () => {
      jest.spyOn(userRepository, 'getAll').mockImplementation(async () => []);

      await expect(useCase.getAll()).rejects.toThrow(
        new NotFoundException('Não existem usuários cadastrados'),
      );
    });
  });
});
