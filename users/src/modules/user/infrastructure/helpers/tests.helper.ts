import { User } from '@user/domain/entities/user.entity';
import { CreateUserDTO } from '../adaptars/primary/http/dtos/create-user.dto';
import { IDConstants } from '@user/domain/values-objects/uuid/id-constants';
import { defaultRoles } from '@user/domain/types/permissions';
import { EmailConstants } from '@user/domain/values-objects/user/email/email-constants';
import { NameConstants } from '@user/domain/values-objects/user/name/name-constants';
import { PasswordConstants } from '@user/domain/values-objects/user/password/password-constants';
import { UsernameConstants } from '@user/domain/values-objects/user/username/username-constants';
import { PhoneNumberConstants } from '@user/domain/values-objects/user/phone-number/phone-number-constants';
import NameVO from '@user/domain/values-objects/user/name/name-vo';
import EmailVO from '@user/domain/values-objects/user/email/email-vo';
import PhoneNumberVO from '@user/domain/values-objects/user/phone-number/phone-number-vo';
import UsernameVO from '@user/domain/values-objects/user/username/username-vo';
import { UserEntity } from '../adaptars/secondary/database/entities/user.entity';
import { UpdateUserDTO } from '../adaptars/primary/http/dtos/update-user.dto';
import { UserUpdate } from '@user/domain/entities/user-update.entity';
import IDVO from '@user/domain/values-objects/uuid/id-vo';
import AvatarVO from '@user/domain/values-objects/user/avatar/avatar-vo';
import { AvatarConstants } from '@user/domain/values-objects/user/avatar/avatar-constants';

export const mockUser = (
  overrides: Partial<Record<keyof User, any>> = {},
): User => {
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

export const mockUpdateUserDTO = (
  overrides: Partial<
    Record<keyof UpdateUserDTO, UpdateUserDTO[keyof UpdateUserDTO]>
  > = {},
): UpdateUserDTO => {
  return {
    name: NameConstants.EXEMPLE,
    username: UsernameConstants.EXEMPLE,
    email: EmailConstants.EXEMPLE,
    phonenumber: PhoneNumberConstants.EXEMPLE,
    avatar: AvatarConstants.EXEMPLE,
    ...overrides,
  };
};

export const mockUserUpdatedDTOToUserUpdated = (
  dto: UpdateUserDTO,
  userId: IDVO,
  overrides: Partial<Record<keyof UserUpdate, any>> = {},
): UserUpdate => {
  const vos = {
    name: new NameVO(dto.name, false),
    username: new UsernameVO(dto.username, false),
    email: new EmailVO(dto.email, false),
    phonenumber: new PhoneNumberVO(dto.phonenumber, false),
    avatar: new AvatarVO(dto.avatar, false),
  };
  const data = {
    userId,
    ...vos,
    roles: defaultRoles,
    updatedAt: new Date('2025-09-02T13:30:08.633Z'),
    ...overrides,
  };

  return new UserUpdate(data);
};

export const mockCreateUserDTOLikeInstance = (
  overrides: Partial<CreateUserDTO> = {},
): CreateUserDTO => {
  const dto = new CreateUserDTO();
  const keys = Object.keys(overrides);

  dto.username = keys.includes('username')
    ? overrides.username
    : UsernameConstants.EXEMPLE;
  dto.email = keys.includes('email') ? overrides.email : EmailConstants.EXEMPLE;
  dto.name = keys.includes('name') ? overrides.name : NameConstants.EXEMPLE;
  dto.password = keys.includes('password')
    ? overrides.password
    : PasswordConstants.EXEMPLE;
  dto.phonenumber = keys.includes('phonenumber')
    ? overrides.phonenumber
    : PhoneNumberConstants.EXEMPLE;
  return dto;
};