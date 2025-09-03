// Enums
import AvatarVO from '../values-objects/user/avatar/avatar-vo';
import EmailVO from '../values-objects/user/email/email-vo';
import NameVO from '../values-objects/user/name/name-vo';
import PhoneNumberVO from '../values-objects/user/phone-number/phone-number-vo';
import UsernameVO from '../values-objects/user/username/username-vo';
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
