import { isEmpty } from 'class-validator';
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
    name?: NameVO;
    username?: UsernameVO;
    email?: EmailVO;
    avatar?: AvatarVO;
    phonenumber?: PhoneNumberVO;
    updatedAt?: Date;
  }) {
    this.userId = props.userId;
    if (!isEmpty(props.name)) this.name = props.name;
    if (!isEmpty(props.username)) this.username = props.username;
    if (!isEmpty(props.email)) this.email = props.email;
    if (!isEmpty(props.avatar)) this.avatar = props.avatar;
    if (!isEmpty(props.phonenumber)) this.phonenumber = props.phonenumber;
    this.updatedAt = props.updatedAt;
  }
}
