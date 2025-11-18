import { v4 } from 'uuid';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  defaultRoles,
  Permissions,
} from '@modules/auth/domain/types/permissions';

export type UserDocument = UserEntity & Document;

@Schema({ timestamps: true, collection: 'users' })
export class UserEntity {
  @Prop({ type: String, default: v4() })
  userID?: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  username: string;

  @Prop({ required: true, type: String })
  email: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ required: true, type: String })
  phonenumber: string;

  @Prop({
    required: true,
    type: [String],
    enum: Permissions,
    default: defaultRoles,
  })
  roles: Permissions[];

  @Prop({ required: true, type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, type: Date, default: Date.now })
  updatedAt: Date;

  constructor(props: {
    userID?: string;
    name: string;
    username: string;
    email: string;
    password: string;
    phonenumber: string;
    roles?: Permissions[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.userID = props.userID ?? v4();
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

export const UserSchema = SchemaFactory.createForClass(UserEntity);
