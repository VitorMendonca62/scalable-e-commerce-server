import { EmailConstants } from '@modules/auth/domain/values-objects/email/email-constants';
import { NameConstants } from '@modules/auth/domain/values-objects/name/name-constants';
import { PasswordConstants } from '@modules/auth/domain/values-objects/password/password-constants';
import { PhoneNumberConstants } from '@modules/auth/domain/values-objects/phone-number/phone-number-constants';
import { UsernameConstants } from '@modules/auth/domain/values-objects/username/username-constants';

// type ValueObjectType = { new (): ValueObject };

export function mockValueObjects() {
  const mockPhoneNumber = jest.fn();
  mockPhoneNumber.prototype.toString = jest
    .fn()
    .mockReturnValue(PhoneNumberConstants.EXEMPLE);

  const mockEmail = jest.fn();
  mockEmail.prototype.toString = jest
    .fn()
    .mockReturnValue(EmailConstants.EXEMPLE);

  const mockName = jest.fn();
  mockName.prototype.toString = jest
    .fn()
    .mockReturnValue(NameConstants.EXEMPLE);

  const mockPassword = jest.fn();
  mockPassword.prototype.toString = jest
    .fn()
    .mockReturnValue(PasswordConstants.EXEMPLE);

  const mockUsername = jest.fn();
  mockUsername.prototype.toString = jest
    .fn()
    .mockReturnValue(UsernameConstants.EXEMPLE);

  jest.mock('@modules/auth/domain/values-objects/email/EmailVO', () => ({
    __esModule: true,
    default: mockEmail,
  }));

  jest.mock('@modules/auth/domain/values-objects/name/NameVO', () => ({
    __esModule: true,
    default: mockName,
  }));

  jest.mock('@modules/auth/domain/values-objects/password/PasswordVO', () => ({
    __esModule: true,
    default: mockPassword,
  }));

  jest.mock(
    '@modules/auth/domain/values-objects/phone-number/PhoneNumberVO',
    () => ({
      __esModule: true,
      default: mockPhoneNumber,
    }),
  );

  jest.mock('@modules/auth/domain/values-objects/username/UsernameVO', () => ({
    __esModule: true,
    default: mockUsername,
  }));
}
