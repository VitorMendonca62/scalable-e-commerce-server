import { TestingModule, Test } from '@nestjs/testing';
import { UserRepository } from '../ports/secondary/user-repository.interface';
import { mockUser, mockUserUpdate } from '@modules/user/helpers/tests.helper';
import { InMemoryUserRepository } from '@user/adaptars/secondary/database/repositories/inmemory-user.repository';
import { ConfigModule } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserUseCase } from './update-user.usecase';
import { User } from '../../domain/entities/user.entity';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        UpdateUserUseCase,
        {
          provide: UserRepository,
          useClass: InMemoryUserRepository,
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  describe('execute', () => {
    const user = mockUser({ username: 'changeuser' });
    const newUser = mockUserUpdate();
    const id = 'USERID';

    beforeEach(() => {
      jest
        .spyOn(userRepository, 'findById')
        .mockImplementation(async () => user);

      jest.spyOn(userRepository, 'update').mockImplementation(async () => user);
    });

    it('should use case call with correct parameters and delete user', async () => {
      const response = await useCase.execute(id, newUser);

      expect(userRepository.findById).toHaveBeenCalledWith(id);
      expect(userRepository.update).toHaveBeenCalledWith(id, newUser);
      expect(response).toBeInstanceOf(User);
      expect(response).toEqual(user);
    });

    it('should throw not found execption when user does not exists', async () => {
      jest
        .spyOn(userRepository, 'findById')
        .mockImplementation(async () => undefined);

      await expect(useCase.execute(id, newUser)).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
    });
  });
});
