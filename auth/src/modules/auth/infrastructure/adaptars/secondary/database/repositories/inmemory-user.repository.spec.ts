import { EmailConstants } from '@modules/auth/domain/values-objects/email/email-constants';
import { InMemoryUserRepository } from './inmemory-user.repository';
import { userLikeJSON } from '@modules/auth/infrastructure/helpers/tests/tests.helper';
import { UsernameConstants } from '@modules/auth/domain/values-objects/username/username-constants';

describe('InMemoryUserRepository', () => {
  let repository: InMemoryUserRepository;

  beforeEach(async () => {
    repository = new InMemoryUserRepository();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(repository.users).toBeDefined();
    expect(repository.users).toHaveLength(0);
  });

  describe('create', () => {
    const user = userLikeJSON();

    it('should create user', async () => {
      const response = await repository.create(user);

      expect(response).toBeUndefined();
    });

    it('should create multiple users', async () => {
      const usersToCreate = [];

      for (let i = 0; i <= 10; i++) {
        usersToCreate.push(userLikeJSON());
      }

      for (const user of usersToCreate) {
        repository.create(user);
      }
    });
  });

  describe('findOne', () => {
    const user = userLikeJSON();

    beforeEach(() => {
      repository.users = [];
      repository.users.push(user);
      repository.users.push(
        userLikeJSON({ email: 'teste@teste.com', username: 'teste13' }),
      );
      repository.users.push(
        userLikeJSON({ email: 'teste1@teste.com', username: 'teste134' }),
      );
    });

    it('should return user with one field', async () => {
      const response = await repository.findOne({
        email: EmailConstants.EXEMPLE,
      });

      expect(response).toBe(user);
    });

    it('should return user with many fields', async () => {
      const response = await repository.findOne({
        email: EmailConstants.EXEMPLE,
        username: UsernameConstants.EXEMPLE,
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
        email: EmailConstants.EXEMPLE.toUpperCase(),
      });

      expect(response).toBe(user);
    });

    it('should be case-sensitive and return undefined when searching by ID ', async () => {
      const response = await repository.findOne({
        _id: user._id.toUpperCase(),
      });

      expect(response).toBeUndefined();
    });
  });
});
