import { IDConstants } from '@modules/user/domain/values-objects/uuid/id-constants';
import { EmailConstants } from '@modules/user/domain/values-objects/user/email/email-constants';
import { NameConstants } from '@modules/user/domain/values-objects/user/name/name-constants';
import { UsernameConstants } from '@modules/user/domain/values-objects/user/username/username-constants';
import { AvatarConstants } from '@modules/user/domain/values-objects/user/avatar/avatar-constants';
import { CreateUserDTO } from '../adaptars/primary/http/dtos/create-user.dto';
import { PhoneNumberConstants } from '@modules/user/domain/values-objects/user/phone-number/phone-number-constants';

type MockValueObjectsKeys = keyof CreateUserDTO | 'avatar' | 'id';

type MockValueObjects = Partial<Record<MockValueObjectsKeys, any>>;

export function mockValueObjects(overrides: MockValueObjects = {}) {
  const mockPhoneNumber = jest.fn();
  mockPhoneNumber.prototype.toString = jest
    .fn()
    .mockReturnValue(overrides.phonenumber ?? PhoneNumberConstants.EXEMPLE);

  mockPhoneNumber.prototype.getValue = jest
    .fn()
    .mockReturnValue(overrides.phonenumber ?? PhoneNumberConstants.EXEMPLE);

  const mockEmail = jest.fn();
  mockEmail.prototype.toString = jest
    .fn()
    .mockReturnValue(overrides.email ?? EmailConstants.EXEMPLE);
  mockEmail.prototype.getValue = jest
    .fn()
    .mockReturnValue(overrides.email ?? EmailConstants.EXEMPLE);

  const mockName = jest.fn();
  mockName.prototype.toString = jest
    .fn()
    .mockReturnValue(overrides.name ?? NameConstants.EXEMPLE);
  mockName.prototype.getValue = jest
    .fn()
    .mockReturnValue(overrides.name ?? NameConstants.EXEMPLE);

  const mockUsername = jest.fn();
  mockUsername.prototype.toString = jest
    .fn()
    .mockReturnValue(overrides.username ?? UsernameConstants.EXEMPLE);
  mockUsername.prototype.getValue = jest
    .fn()
    .mockReturnValue(overrides.username ?? UsernameConstants.EXEMPLE);

  const mockID = jest.fn();
  mockID.prototype.toString = jest
    .fn()
    .mockReturnValue(overrides.id ?? IDConstants.EXEMPLE);
  mockID.prototype.getValue = jest
    .fn()
    .mockReturnValue(overrides.id ?? IDConstants.EXEMPLE);

  const mockAvatar = jest.fn();
  mockAvatar.prototype.toString = jest
    .fn()
    .mockReturnValue(overrides.avatar ?? AvatarConstants.EXEMPLE);
  mockAvatar.prototype.getValue = jest
    .fn()
    .mockReturnValue(overrides.avatar ?? AvatarConstants.EXEMPLE);

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
