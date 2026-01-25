import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import { PasswordHashedConstants } from '@auth/domain/values-objects/constants';
import { type Mocked } from 'vitest';

export class PasswordHasherFactory {
  default(): Mocked<PasswordHasher> {
    const passwordHasher: Mocked<PasswordHasher> = {
      hash: vi.fn(),
      compare: vi.fn(),
    };

    passwordHasher.hash.mockReturnValue(PasswordHashedConstants.EXEMPLE);
    passwordHasher.compare.mockReturnValue(true);

    return passwordHasher;
  }
}
