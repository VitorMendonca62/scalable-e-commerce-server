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
    
    if (this.name != null && this.name != undefined) {
      this.name = props.name;
    }
    if (this.username != null && this.username != undefined) {
      this.username = props.username;
    }
    if (this.email != null && this.email != undefined) {
      this.email = props.email;
    }
    if (this.avatar != null && this.avatar != undefined) {
      this.avatar = props.avatar;
    }
    if (this.phonenumber != null && this.phonenumber != undefined) {
      this.phonenumber = props.phonenumber;
    }
    if (this.updatedAt != null && this.updatedAt != undefined) {
      this.updatedAt = props.updatedAt;
    }
  }
}
