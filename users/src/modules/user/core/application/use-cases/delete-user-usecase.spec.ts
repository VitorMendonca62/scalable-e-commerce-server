import { TestingModule, Test } from '@nestjs/testing';
import { UserRepository } from '../ports/secondary/user-repository.interface';
import { mockUser } from '@modules/user/helpers/tests.helper';
import { InMemoryUserRepository } from '@user/adaptars/secondary/database/repositories/inmemory-user.repository';
import { ConfigModule } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { DeleteUserUseCase } from './delete-user.usecase';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        DeleteUserUseCase,
        {
          provide: UserRepository,
          useClass: InMemoryUserRepository,
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  describe('execute', () => {
    const user = mockUser();
    const id = 'USERID';

    beforeEach(() => {
      jest
        .spyOn(userRepository, 'findById')
        .mockImplementation(async () => user);

      jest.spyOn(userRepository, 'delete').mockImplementation(() => undefined);
    });

    it('should use case call with correct parameters and delete user', async () => {
      const response = await useCase.execute(id);

      expect(userRepository.findById).toHaveBeenCalledWith(id);
      expect(userRepository.delete).toHaveBeenCalledWith(id);
      expect(response).toBeUndefined();
    });

    it('should throw not found execption when user does not exists', async () => {
      jest
        .spyOn(userRepository, 'findById')
        .mockImplementation(async () => undefined);

      await expect(useCase.execute(id)).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
    });
  });
});
