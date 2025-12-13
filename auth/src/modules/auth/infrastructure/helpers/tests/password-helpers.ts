import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';

export const mockPasswordHasher: () => jest.Mocked<PasswordHasher> = () => {
  const passwordHasher: jest.Mocked<PasswordHasher> = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  passwordHasher.hash.mockReturnValue('Hash');
  passwordHasher.compare.mockReturnValue(true);

  return passwordHasher;
};
