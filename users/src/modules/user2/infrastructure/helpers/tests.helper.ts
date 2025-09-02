import { User } from '@modules/user2/domain/entities/user.entity';
import { CreateUserDTO } from '../adaptars/primary/http/dtos/create-user.dto';
import { IDConstants } from '@modules/user2/domain/values-objects/uuid/id-constants';
import { defaultRoles } from '@modules/user2/domain/types/permissions';
import { EmailConstants } from '@modules/user2/domain/values-objects/user/email/email-constants';
import { NameConstants } from '@modules/user2/domain/values-objects/user/name/name-constants';
import { PasswordConstants } from '@modules/user2/domain/values-objects/user/password/password-constants';
import { UsernameConstants } from '@modules/user2/domain/values-objects/user/username/username-constants';
import { PhoneNumberConstants } from '@modules/user2/domain/values-objects/user/phone-number/phone-number-constants';
import NameVO from '@modules/user2/domain/values-objects/user/name/name-vo';
import EmailVO from '@modules/user2/domain/values-objects/user/email/email-vo';
import PhoneNumberVO from '@modules/user2/domain/values-objects/user/phone-number/phone-number-vo';
import UsernameVO from '@modules/user2/domain/values-objects/user/username/username-vo';
import { UserEntity } from '../adaptars/secondary/database/entities/user.entity';

export const mockUser = (overrides: Partial<Record<keyof User, any>> = {}): User => {
  const data = {
    userId: IDConstants.EXEMPLE,
    name: new NameVO(NameConstants.EXEMPLE, true),
    username: new UsernameVO(UsernameConstants.EXEMPLE, true),
    email: new EmailVO(EmailConstants.EXEMPLE, true),
    phonenumber: new PhoneNumberVO(PhoneNumberConstants.EXEMPLE, true),
    active: true,
    email_verified: false,
    phone_verified: false,
    avatar: null,
    roles: defaultRoles,
    createdAt: new Date('2025-09-02T13:30:08.633Z'),
    updatedAt: new Date('2025-09-02T13:30:08.633Z'),
    ...overrides,
  };
  return new User(data);
};

export const mockUserEntity = (
  overrides: Partial<Record<keyof User, any>> = {},
): UserEntity => {
  const data = {
    userId: IDConstants.EXEMPLE,
    name: NameConstants.EXEMPLE,
    username: UsernameConstants.EXEMPLE,
    email: EmailConstants.EXEMPLE,
    phonenumber: PhoneNumberConstants.EXEMPLE,
    active: true,
    email_verified: false,
    phone_verified: false,
    avatar: null,
    roles: defaultRoles,
    createdAt: new Date('2025-09-02T13:30:08.633Z'),
    updatedAt: new Date('2025-09-02T13:30:08.633Z'),
    ...overrides,
  };
  return data;
};

export const mockCreatedUserDTOToUser = (
  dto: CreateUserDTO,
  overrides: Partial<Record<keyof User, any>> = {},
): User => {
  const vos = {
    name: new NameVO(dto.name, true),
    username: new UsernameVO(dto.username, true),
    email: new EmailVO(dto.email, true),
    phonenumber: new PhoneNumberVO(dto.phonenumber, true),
  };
  const data = {
    userId: IDConstants.EXEMPLE,
    ...vos,
    active: true,
    email_verified: false,
    phone_verified: false,
    avatar: null,
    roles: defaultRoles,
    createdAt: new Date('2025-09-02T13:30:08.633Z'),
    updatedAt: new Date('2025-09-02T13:30:08.633Z'),
    ...overrides,
  };

  return new User(data);
};

export const mockCreateUserDTO = (
  overrides: Partial<
    Record<keyof CreateUserDTO, CreateUserDTO[keyof CreateUserDTO]>
  > = {},
): CreateUserDTO => {
  return {
    name: NameConstants.EXEMPLE,
    username: UsernameConstants.EXEMPLE,
    email: EmailConstants.EXEMPLE,
    password: PasswordConstants.EXEMPLE,
    phonenumber: PhoneNumberConstants.EXEMPLE,
    ...overrides,
  };
};
