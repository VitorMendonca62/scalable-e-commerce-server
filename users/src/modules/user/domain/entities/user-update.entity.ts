import {
  NameVO,
  UsernameVO,
  EmailVO,
  AvatarVO,
  PhoneNumberVO,
} from '../values-objects/user/values-object';
import IDVO from '../values-objects/uuid/id-vo';

export class UserUpdate {
  userId: IDVO;
  name?: NameVO;
  username?: UsernameVO;
  email?: EmailVO;
  avatar?: AvatarVO;
  phonenumber?: PhoneNumberVO;
  updatedAt?: Date;

  constructor(props: {
    userId: IDVO;
    name: NameVO;
    username: UsernameVO;
    email: EmailVO;
    avatar: AvatarVO;
    phonenumber: PhoneNumberVO;
    updatedAt?: Date;
  }) {
    this.userId = props.userId;
    this.name = props.name;
    this.username = props.username;
    this.email = props.email;
    this.avatar = props.avatar;
    this.phonenumber = props.phonenumber;
    this.updatedAt = props.updatedAt;
  }
}
