import { PermissionsSystem } from '@auth/domain/types/permissions';
import { v7 } from 'uuid';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { defaultRoles } from '@auth/domain/constants/roles';
import { AccountsProvider } from '@auth/domain/types/accounts-provider';

export type UserDocument = UserModel & Document;

@Schema({ timestamps: true, collection: 'users' })
export class UserModel {
  @Prop({ type: String, default: v7(), unique: true })
  userID: string;

  @Prop({ required: true, type: String, unique: true })
  email: string;

  @Prop({ type: String })
  password: string | null | undefined;

  @Prop({ type: String })
  phoneNumber: string | null | undefined;

  @Prop({
    required: true,
    type: [String],
    enum: PermissionsSystem,
    default: defaultRoles,
  })
  roles: PermissionsSystem[];

  @Prop({ required: true, type: Boolean, default: true })
  active: boolean;

  @Prop({
    required: true,
    type: String,
    enum: AccountsProvider,
    default: AccountsProvider.DEFAULT,
  })
  accountProvider: string;

  @Prop({
    type: String,
  })
  accountProviderID: string | null | undefined;

  @Prop({ required: true, type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, type: Date, default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
