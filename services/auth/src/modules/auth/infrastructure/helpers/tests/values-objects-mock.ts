import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import {
  EmailConstants,
  IDConstants,
  PasswordConstants,
  PasswordHashedConstants,
} from '@auth/domain/values-objects/constants';
import { type Mock } from 'vitest';

// Mock Email

export const mockEmailConstructor: Mock = vi.fn();
export const mockEmailGetValue: Mock = vi
  .fn()
  .mockReturnValue(EmailConstants.EXEMPLE);
class MockEmail {
  constructor(value?: string) {
    mockEmailConstructor(value);
  }
  getValue = mockEmailGetValue;
}

vi.mock('@auth/domain/values-objects/email/email-vo', () => ({
  default: MockEmail,
}));

// Mock Password

export const mockPasswordConstructor: Mock = vi.fn();
export const mockPasswordGetValue: Mock = vi
  .fn()
  .mockReturnValue(PasswordConstants.EXEMPLE);
export const mockPasswordCompare: Mock = vi.fn().mockResolvedValue(true);

class MockPassword {
  constructor(
    value: string,
    canHashPassword: boolean,
    passwordHasher: PasswordHasher,
  ) {
    mockPasswordConstructor(value, canHashPassword, passwordHasher);
  }
  getValue = mockPasswordGetValue;
  comparePassword = mockPasswordCompare;
}

vi.mock('@auth/domain/values-objects/password/password-vo', () => ({
  default: MockPassword,
}));

// Mock HashedPassword

export const mockPasswordHashedConstructor: Mock = vi.fn();
export const mockPasswordHashedGetValue: Mock = vi
  .fn()
  .mockReturnValue(PasswordHashedConstants.EXEMPLE);
export const mockPasswordHashedCompare: Mock = vi.fn().mockResolvedValue(true);
class MockHashedPassword {
  constructor(value: string, passwordHasher: PasswordHasher) {
    mockPasswordHashedConstructor(value, passwordHasher);
  }
  getValue = mockPasswordHashedGetValue;
  comparePassword = mockPasswordHashedCompare;
}

vi.mock(
  '@auth/domain/values-objects/password-hashed/password-hashed-vo',
  () => ({
    default: MockHashedPassword,
  }),
);

// Mock ID

export const mockIDConstructor: Mock = vi.fn();
export const mockIDGetValue: Mock = vi
  .fn()
  .mockReturnValue(IDConstants.EXEMPLE);
class MockID {
  constructor(value: string) {
    mockIDConstructor(value);
  }
  getValue = mockIDGetValue;
}

vi.mock('@auth/domain/values-objects/id/id-vo', () => ({
  default: MockID,
}));
