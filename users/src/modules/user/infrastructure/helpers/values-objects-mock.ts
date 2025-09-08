import { IDConstants } from '@modules/user/domain/values-objects/uuid/id-constants';
import { EmailConstants } from '@modules/user/domain/values-objects/user/email/email-constants';
import { NameConstants } from '@modules/user/domain/values-objects/user/name/name-constants';
import { PhoneNumberConstants } from '@modules/user/domain/values-objects/user/phone-number/phone-number-constants';
import { UsernameConstants } from '@modules/user/domain/values-objects/user/username/username-constants';
import { AvatarConstants } from '@modules/user/domain/values-objects/user/avatar/avatar-constants';

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

  const mockUsername = jest.fn();
  mockUsername.prototype.toString = jest
    .fn()
    .mockReturnValue(UsernameConstants.EXEMPLE);

  const mockID = jest.fn();
  mockID.prototype.toString = jest.fn().mockReturnValue(IDConstants.EXEMPLE);

  const mockAvatar = jest.fn();
  mockAvatar.prototype.toString = jest
    .fn()
    .mockReturnValue(AvatarConstants.EXEMPLE);

  jest.mock('@modules/user/domain/values-objects/user/email/email-vo', () => ({
    __esModule: true,
    default: mockEmail,
  }));

  jest.mock('@modules/user/domain/values-objects/user/name/name-vo', () => ({
    __esModule: true,
    default: mockName,
  }));

  jest.mock(
    '@modules/user/domain/values-objects/user/phone-number/phone-number-vo',
    () => ({
      __esModule: true,
      default: mockPhoneNumber,
    }),
  );

  jest.mock(
    '@modules/user/domain/values-objects/user/username/username-vo',
    () => ({
      __esModule: true,
      default: mockUsername,
    }),
  );

  jest.mock(
    '@modules/user/domain/values-objects/user/avatar/avatar-vo',
    () => ({
      __esModule: true,
      default: mockAvatar,
    }),
  );

  jest.mock('@modules/user/domain/values-objects/uuid/id-vo', () => ({
    __esModule: true,
    default: mockID,
  }));
}
