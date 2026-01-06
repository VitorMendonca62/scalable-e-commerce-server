import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';
import { PasswordHashedConstants } from '@auth/domain/values-objects/password-hashed/password-hashed-constants';
import { PasswordConstants } from '@auth/domain/values-objects/password/password-constants';
import { PhoneNumberConstants } from '@auth/domain/values-objects/phone-number/phone-number-constants';

type FieldsMocks =
  | 'phoneNumber'
  | 'email'
  | 'password'
  | 'hashedPassword'
  | 'id'
  | 'all';

export function mockValueObjects(fields: FieldsMocks[]) {
  if (fields.includes('phoneNumber') || fields.includes('all')) {
    const mockPhoneNumber = jest.fn();
    mockPhoneNumber.prototype.getValue = jest
      .fn()
      .mockReturnValue(PhoneNumberConstants.EXEMPLE);

    jest.mock(
      '@auth/domain/values-objects/phone-number/phone-number-vo',
      () => ({
        __esModule: true,
        default: mockPhoneNumber,
      }),
    );
  }

  if (fields.includes('email') || fields.includes('all')) {
    const mockEmail = jest.fn();
    mockEmail.prototype.getValue = jest
      .fn()
      .mockReturnValue(EmailConstants.EXEMPLE);

    jest.mock('@auth/domain/values-objects/email/email-vo', () => ({
      __esModule: true,
      default: mockEmail,
    }));
  }

  if (fields.includes('password') || fields.includes('all')) {
    const mockPassword = jest.fn();
    mockPassword.prototype.getValue = jest
      .fn()
      .mockReturnValue(PasswordConstants.EXEMPLE);
    mockPassword.prototype.comparePassword = jest.fn();

    jest.mock('@auth/domain/values-objects/password/password-vo', () => ({
      __esModule: true,
      default: mockPassword,
    }));
  }

  if (fields.includes('hashedPassword') || fields.includes('all')) {
    const mockHashedPassword = jest.fn();
    mockHashedPassword.prototype.getValue = jest
      .fn()
      .mockReturnValue(PasswordHashedConstants.EXEMPLE);
    mockHashedPassword.prototype.comparePassword = jest.fn();

    jest.mock(
      '@auth/domain/values-objects/password-hashed/password-hashed-vo',
      () => ({
        __esModule: true,
        default: mockHashedPassword,
      }),
    );
  }

  if (fields.includes('id') || fields.includes('all')) {
    const mockID = jest.fn();
    mockID.prototype.getValue = jest.fn().mockReturnValue(IDConstants.EXEMPLE);

    jest.mock('@auth/domain/values-objects/id/id-vo', () => ({
      __esModule: true,
      default: mockID,
    }));
  }
}
