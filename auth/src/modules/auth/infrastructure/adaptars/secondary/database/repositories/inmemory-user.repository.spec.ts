import { InMemoryUserRepository } from './inmemory-user.repository';
import EmailVO from '@modules/auth/domain/values-objects/email.vo';
import UsernameVO from '@modules/auth/domain/values-objects/username.vo';
import { mockUser } from '@modules/auth/infrastructure/helpers/tests.helper';
import { Test, TestingModule } from '@nestjs/testing';

describe('InMemoryUserRepository', () => {
  let repository: InMemoryUserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [InMemoryUserRepository],
    }).compile();

    repository = module.get<InMemoryUserRepository>(InMemoryUserRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(repository.users).toBeDefined();
    expect(repository.users).toHaveLength(0);
  });

  describe('create', () => {
    const user = mockUser();

    it('should create user', async () => {
      const response = await repository.create(user);

      expect(response).toBeUndefined();
    });

    it('should create multiple users', async () => {
      const usersToCreate = [];

      for (let i = 0; i <= 10; i++) {
        usersToCreate.push(mockUser());
      }

      for (const user of usersToCreate) {
        repository.create(user);
      }
    });
  });

  describe('findOne', () => {
    const user = mockUser();

    beforeEach(() => {
      repository.users = [];
      repository.users.push(user);
      repository.users.push(
        mockUser({ email: 'teste@teste.com', username: 'teste13' }),
      );
      repository.users.push(
        mockUser({ email: 'teste1@teste.com', username: 'teste134' }),
      );
    });

    it('should return user with one field', async () => {
      const response = await repository.findOne({ email: EmailVO.EXEMPLE });

      expect(response).toBe(user);
    });

    it('should return user with many fields', async () => {
      const response = await repository.findOne({
        email: EmailVO.EXEMPLE,
        username: UsernameVO.EXEMPLE,
      });

      expect(response).toBe(user);
    });

    it('should return undefined when not found user with email', async () => {
      const response = await repository.findOne({
        username: 'usernotfound',
      });

      expect(response).toBeUndefined();
    });

    it('should return the user even with case differences when case sensitivity is disabled', async () => {
      const response = await repository.findOne({
        email: EmailVO.EXEMPLE.toUpperCase(),
      });

      expect(response).toBe(user);
    });

    it('should be case-sensitive when searching by ID ', async () => {
      const response = await repository.findOne({
        _id: user._id.toUpperCase(),
      });

      expect(response).toBeUndefined();
    });
  });
});
