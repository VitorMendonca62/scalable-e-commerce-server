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
  let users: User[];

  beforeEach(() => {
    repository = new InMemoryUserRepository();
  });

  describe('create', () => {
    beforeEach(() => {
      users = mockUserList();
      repository.users = users;
      jest.spyOn(repository.users, 'push');
    });

    it('should create user', async () => {
      const user = new User(mockCreateUserDTO());

      await repository.create(user);

      expect(repository.users.push).toHaveBeenCalledWith(user);
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
      expect(repository.users.push).toHaveBeenCalledTimes(usersToCreate.length);
    });
  });

  describe('findByEmail', () => {
    const validEmail = EmailVO.EXEMPLE;
    const user = mockUser({ email: validEmail });

    beforeEach(() => {
      users = mockUserList();
      repository.users = users;
      jest.spyOn(repository.users, 'find').mockImplementation(() => user);
      repository.users.push(user);
    });

    it('should return user with email passed', async () => {
      const response = await repository.findByEmail(validEmail);

      expect(response).toBe(user);
      expect(repository.users.find).toHaveBeenCalled();
    });

    it('should return undefined when not found user with email', async () => {
      jest.spyOn(repository.users, 'find').mockImplementation(() => undefined);

      const response = await repository.findByEmail('emailnotfound@email.com');

      expect(response).toBeUndefined();
    });

    it('should be case sensitive if getValue is case sensitive', async () => {
      jest.spyOn(repository.users, 'find').mockImplementation(() => undefined);

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
      jest.spyOn(repository.users, 'find').mockImplementation(() => user);
      repository.users.push(user);
    });

    it('should return user with username passed', async () => {
      const response = await repository.findByUsername(validUsername);

      expect(response).toBe(user);
      expect(repository.users.find).toHaveBeenCalled();
    });

    it('should return undefined when not found user with username', async () => {
      jest.spyOn(repository.users, 'find').mockImplementation(() => undefined);

      const response = await repository.findByUsername('emailnotfound');

      expect(response).toBeUndefined();
    });

    it('should be case sensitive if getValue is case sensitive', async () => {
      jest.spyOn(repository.users, 'find').mockImplementation(() => undefined);

      const response = await repository.findByUsername(
        validUsername.toUpperCase(),
      );

      expect(response).toBeUndefined();
    });
  });
});
