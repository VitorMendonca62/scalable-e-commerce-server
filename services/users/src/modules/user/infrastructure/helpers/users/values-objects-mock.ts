import {
  AvatarConstants,
  EmailConstants,
  NameConstants,
  PhoneNumberConstants,
  UsernameConstants,
} from '@modules/user/domain/values-objects/user/constants';

import { type Mock } from 'vitest';

// Mock Name

export const mockNameConstructor: Mock = vi.fn();
export const mockNameGetValue: Mock = vi
  .fn()
  .mockReturnValue(NameConstants.EXEMPLE);
class MockName {
  constructor(value?: string) {
    mockNameConstructor(value);
  }
  getValue = mockNameGetValue;
}

// Mock Username

export const mockUsernameConstructor: Mock = vi.fn();
export const mockUsernameGetValue: Mock = vi
  .fn()
  .mockReturnValue(UsernameConstants.EXEMPLE);
class MockUsername {
  constructor(value?: string) {
    mockUsernameConstructor(value);
  }
  getValue = mockUsernameGetValue;
}

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

// Mock PhoneNumber

export const mockPhoneNumberConstructor: Mock = vi.fn();
export const mockPhoneNumberGetValue: Mock = vi
  .fn()
  .mockReturnValue(PhoneNumberConstants.EXEMPLE);
class MockPhoneNumber {
  constructor(value: string) {
    mockPhoneNumberConstructor(value);
  }
  getValue = mockPhoneNumberGetValue;
}

// Mock Avatar

export const mockAvatarConstructor: Mock = vi.fn();
export const mockAvatarGetValue: Mock = vi
  .fn()
  .mockReturnValue(AvatarConstants.EXEMPLE);
class MockAvatar {
  constructor(value: string) {
    mockAvatarConstructor(value);
  }
  getValue = mockAvatarGetValue;
}

vi.mock('@modules/user/domain/values-objects/user/values-object', () => {
  return {
    AvatarVO: MockAvatar,
    EmailVO: MockEmail,
    NameVO: MockName,
    PhoneNumberVO: MockPhoneNumber,
    UsernameVO: MockUsername,
  };
});
