import { TestingModule, Test } from '@nestjs/testing';
import { UserRepository } from '../ports/secondary/user-repository.interface';
import { mockUser } from '@modules/user/helpers/tests.helper';
import { InMemoryUserRepository } from '@user/adaptars/secondary/database/repositories/inmemory-user.repository';
import { ConfigModule } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { GetUserUseCase } from './get-user.usecase';
import { User } from '../../domain/entities/user.entity';

describe('GetUserUseCase', () => {
  let useCase: GetUserUseCase;
  let userRepository: UserRepository;

  const user = mockUser();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        GetUserUseCase,
        {
          provide: UserRepository,
          useClass: InMemoryUserRepository,
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    useCase = module.get<GetUserUseCase>(GetUserUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  describe('findById', () => {
    const id = 'USERID';

    beforeEach(() => {
      jest
        .spyOn(userRepository, 'findById')
        .mockImplementation(async () => user);
    });

    it('should use case call with correct parameters and return user', async () => {
      const response = await useCase.findById(id);

      expect(userRepository.findById).toHaveBeenCalledWith(id);
      expect(response).toBeInstanceOf(User);
      expect(response).toEqual(user);
    });

    it('should throw not found execption when user does not exists', async () => {
      jest
        .spyOn(userRepository, 'findById')
        .mockImplementation(async () => undefined);

      await expect(useCase.findById(id)).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
    });
  });

  describe('findById', () => {
    const username = 'USERNAME';

    beforeEach(() => {
      jest
        .spyOn(userRepository, 'findByUsername')
        .mockImplementation(async () => user);
    });

    it('should use case call with correct parameters and return user', async () => {
      const response = await useCase.findByUsername(username);

      expect(userRepository.findByUsername).toHaveBeenCalledWith(username);
      expect(response).toBeInstanceOf(User);
      expect(response).toEqual(user);
    });

    it('should throw not found execption when user does not exists', async () => {
      jest
        .spyOn(userRepository, 'findByUsername')
        .mockImplementation(async () => undefined);

      await expect(useCase.findByUsername(username)).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
    });
  });
});
