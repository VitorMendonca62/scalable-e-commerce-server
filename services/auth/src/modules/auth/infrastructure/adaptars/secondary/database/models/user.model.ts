import { v7 } from 'uuid';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { defaultRoles, Permissions } from '@auth/domain/types/permissions';

export type UserDocument = UserModel & Document;

@Schema({ timestamps: true, collection: 'users' })
export class UserModel {
  @Prop({ type: String, default: v7(), unique: true })
  userID: string;

  @Prop({ required: true, type: String, unique: true })
  email: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ required: true, type: String, unique: true })
  phoneNumber: string;

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
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
