import {
  NameVO,
  UsernameVO,
  AvatarVO,
  PhoneNumberVO,
} from '../values-objects/user/values-object';
import IDVO from '../values-objects/common/uuid/id-vo';

export class UserUpdateEntity {
  userID: IDVO;
  name: NameVO | undefined;
  username: UsernameVO | undefined;
  avatar: AvatarVO | undefined;
  phoneNumber: PhoneNumberVO | undefined;
  updatedAt: Date;

  constructor(props: {
    userID: IDVO;
    name: NameVO | undefined;
    username: UsernameVO | undefined;
    avatar: AvatarVO | undefined;
    phoneNumber: PhoneNumberVO | undefined;
    updatedAt: Date;
  }) {
    this.userID = props.userID;
    this.name = props.name;
    this.username = props.username;
    this.avatar = props.avatar;
    this.phoneNumber = props.phoneNumber;
    this.updatedAt = props.updatedAt;
  }
}
