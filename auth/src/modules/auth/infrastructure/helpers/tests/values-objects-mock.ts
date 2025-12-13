import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';
import { PasswordConstants } from '@auth/domain/values-objects/password/password-constants';
import { PhoneNumberConstants } from '@auth/domain/values-objects/phone-number/phone-number-constants';

// type ValueObjectType = { new (): ValueObject };

export function mockValueObjects() {
  const mockPhoneNumber = jest.fn();
  mockPhoneNumber.prototype.getValue = jest
    .fn()
    .mockReturnValue(PhoneNumberConstants.EXEMPLE);

  const mockEmail = jest.fn();
  mockEmail.prototype.getValue = jest
    .fn()
    .mockReturnValue(EmailConstants.EXEMPLE);

  const mockPassword = jest.fn();
  mockPassword.prototype.getValue = jest
    .fn()
    .mockReturnValue(PasswordConstants.EXEMPLE);
  mockPassword.prototype.comparePassword = jest.fn();

  const mockID = jest.fn();
  mockID.prototype.getValue = jest.fn().mockReturnValue(IDConstants.EXEMPLE);

  jest.mock('@auth/domain/values-objects/email/email-vo', () => ({
    __esModule: true,
    default: mockEmail,
  }));

  jest.mock('@auth/domain/values-objects/password/password-vo', () => ({
    __esModule: true,
    default: mockPassword,
  }));

  jest.mock('@auth/domain/values-objects/phone-number/phone-number-vo', () => ({
    __esModule: true,
    default: mockPhoneNumber,
  }));
  jest.mock('@auth/domain/values-objects/id/id-vo', () => ({
    __esModule: true,
    default: mockID,
  }));
}
