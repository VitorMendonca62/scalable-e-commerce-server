import { InMemoryUserRepository } from './inmemory-user.repository';
import EmailVO from '@modules/auth/domain/values-objects/email.vo';
import UsernameVO from '@modules/auth/domain/values-objects/username.vo';
import { mockUser } from '@modules/auth/infrastructure/helpers/tests.helper';

describe('InMemoryUserRepository', () => {
  let repository: InMemoryUserRepository;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
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

  describe('findByEmail', () => {
    const validEmail = EmailVO.EXEMPLE;
    const user = mockUser({ email: validEmail });

    beforeEach(() => {
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
