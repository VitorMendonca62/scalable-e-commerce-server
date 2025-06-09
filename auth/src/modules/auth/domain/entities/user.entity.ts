import { defaultRoles, Permissions } from '../types/permissions';

// Values Objects
import EmailVO from '../values-objects/email.vo';
import PasswordVO from '../values-objects/password.vo';
import PhoneNumberVO from '../values-objects/phonenumber.vo';
import NameVO from '../values-objects/name.vo';
import UsernameVO from '../values-objects/username.vo';
import { v4 } from 'uuid';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ type: String, default: v4() })
  _id?: string;

  @Prop({ required: true, type: String })
  name: NameVO;

  @Prop({ required: true, type: String })
  username: UsernameVO;

  @Prop({ required: true, type: String })
  email: EmailVO;

  @Prop({ required: true, type: String })
  password: PasswordVO;

  @Prop({ required: true, type: String })
  phonenumber: PhoneNumberVO;

  @Prop({
    required: true,
    type: [String],
    enum: Permissions,
    default: () => defaultRoles,
  })
  roles: Permissions[];

  @Prop({ required: true, type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, type: Date, default: Date.now })
  updatedAt: Date;

  constructor(props: {
    _id?: string;
    name: NameVO;
    username: UsernameVO;
    email: EmailVO;
    password: PasswordVO;
    phonenumber: PhoneNumberVO;
    roles?: Permissions[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = props._id ?? v4();
    this.name = props.name;
    this.username = props.username;
    this.email = props.email;
    this.password = props.password;
    this.phonenumber = props.phonenumber;
    this.roles = props.roles ?? defaultRoles;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
