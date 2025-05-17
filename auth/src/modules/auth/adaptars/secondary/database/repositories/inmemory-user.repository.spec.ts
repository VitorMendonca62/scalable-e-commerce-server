import { User } from '@modules/auth/core/domain/entities/user.entity';
import { InMemoryUserRepository } from './inmemory-user.repository';
import {
  mockCreateUserDTO,
  mockUser,
  mockUserList,
} from '@modules/auth/helpers/tests.helper';
import EmailVO from '@modules/auth/core/domain/types/values-objects/email.vo';
import UsernameVO from '@modules/auth/core/domain/types/values-objects/username.vo';

describe('InMemoryUserRepository', () => {
  let repository: InMemoryUserRepository;
  let users: User[] = [];

  beforeEach(() => {
    repository = new InMemoryUserRepository();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(repository.users).toBeDefined();
    expect(repository.users).toHaveLength(0);
  });

  describe('create', () => {
    beforeEach(() => {
      users = mockUserList();
      repository.users = users;
    });

    it('should overwrite existing _id with a new uuid', async () => {
      const user = mockUser();
      user._id = 'custom-id';

      await repository.create(user);

      expect(user._id).not.toBe('custom-id');
    });

    it('should create user', async () => {
      const user = new User(mockCreateUserDTO());

      const response = await repository.create(user);

      expect(response).toBeUndefined();
      expect(repository.users).toContain(user);
    });

    it('should create multiple users', async () => {
      const usersToCreate = [];

      for (let i = 0; i <= 10; i++) {
        usersToCreate.push(mockUser());
      }

      for (const user of usersToCreate) {
        repository.create(user);
      }

      for (const user of usersToCreate) {
        expect(repository.users).toContain(user);
      }
    });
  });

  describe('findByEmail', () => {
    const validEmail = EmailVO.EXEMPLE;
    const user = mockUser({ email: validEmail });

    beforeEach(() => {
      users = mockUserList();
      repository.users = users;

      repository.users.push(user);
    });

    it('should return user with email passed', async () => {
      const response = await repository.findByEmail(validEmail);

      expect(response).toBe(user);
    });

    it('should return undefined when not found user with email', async () => {
      const response = await repository.findByEmail('emailnotfound@email.com');

      expect(response).toBeUndefined();
    });

    it('should be case sensitive if getValue is case sensitive', async () => {
      const response = await repository.findByEmail(validEmail.toUpperCase());

      expect(response).toBeUndefined();
    });
  });

  describe('findByUsername', () => {
    const validUsername = UsernameVO.EXEMPLE;
    const user = mockUser({ username: validUsername });

    beforeEach(() => {
      users = mockUserList();
      repository.users = users;
      repository.users.push(user);
    });

    it('should return user with username passed', async () => {
      const response = await repository.findByUsername(validUsername);

      expect(response).toBe(user);
    });

    it('should return undefined when not found user with username', async () => {
      const response = await repository.findByUsername('usernamenotfound');

      expect(response).toBeUndefined();
    });

    it('should be case sensitive if getValue is case sensitive', async () => {
      const response = await repository.findByUsername(
        validUsername.toUpperCase(),
      );

      expect(response).toBeUndefined();
    });
  });

  describe('findById', () => {
    const validId = 'validid';
    const user = mockUser({ _id: validId });

    beforeEach(() => {
      users = mockUserList();
      repository.users = users;
      repository.users.push(user);
    });

    it('should return user with id passed', async () => {
      const response = await repository.findById(validId);

      expect(response).toBe(user);
    });

    it('should return undefined when not found user with username', async () => {
      const response = await repository.findById('211221');

      expect(response).toBeUndefined();
    });
  });
});
