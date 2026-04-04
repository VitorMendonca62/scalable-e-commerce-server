// Enums
import { PermissionsSystem } from '../types/permissions';
import {
  NameVO,
  UsernameVO,
  EmailVO,
  AvatarVO,
  PhoneNumberVO,
} from '../values-objects/user/values-object';
import IDVO from '../values-objects/common/uuid/id-vo';
import { AddressRecord } from '@user/domain/types/address-record';

export class UserEntity {
  userID: IDVO;
  name: NameVO;
  username: UsernameVO;
  email: EmailVO;
  avatar: AvatarVO | undefined;
  phoneNumber: PhoneNumberVO | undefined;
  roles: PermissionsSystem[];
  createdAt: Date;
  updatedAt: Date;
  addresses: AddressRecord[];

  constructor(props: {
    userID: IDVO;
    name: NameVO;
    username: UsernameVO;
    email: EmailVO;
    avatar: AvatarVO | undefined;
    phoneNumber: PhoneNumberVO | undefined;
    roles: PermissionsSystem[];
    addresses: AddressRecord[] | undefined;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.userID = props.userID;
    this.name = props.name;
    this.username = props.username;
    this.email = props.email;
    this.avatar = props.avatar;
    this.phoneNumber = props.phoneNumber;
    this.roles = props.roles;
    this.addresses = props.addresses ?? [];
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
