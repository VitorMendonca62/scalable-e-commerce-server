import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { InMemoryUserRepository } from './inmemory-user.repository';
import { mockUserLikeJSON } from '@auth/infrastructure/helpers/tests/tests.helper';
import { PhoneNumberConstants } from '@auth/domain/values-objects/phone-number/phone-number-constants';

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

  describe('findOne', () => {
    const user = mockUserLikeJSON();

    beforeEach(() => {
      repository.users = [];
      repository.users.push(user);
      repository.users.push(mockUserLikeJSON({ email: 'teste@teste.com' }));
      repository.users.push(mockUserLikeJSON({ email: 'teste1@teste.com' }));
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
        phoneNumber: PhoneNumberConstants.EXEMPLE,
      });

      expect(response).toBe(user);
    });

    it('should return undefined when not found user', async () => {
      const response = await repository.findOne({
        email: 'usernotfound@email.com',
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
        userID: user.userID.toUpperCase(),
      });

      expect(response).toBeUndefined();
    });
  });
});
