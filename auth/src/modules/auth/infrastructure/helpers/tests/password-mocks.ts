import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import { PasswordHashedConstants } from '@auth/domain/values-objects/password-hashed/password-hashed-constants';

export const mockPasswordHasher: () => jest.Mocked<PasswordHasher> = () => {
  const passwordHasher: jest.Mocked<PasswordHasher> = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  passwordHasher.hash.mockReturnValue(PasswordHashedConstants.EXEMPLE);
  passwordHasher.compare.mockReturnValue(true);

  return passwordHasher;
};
