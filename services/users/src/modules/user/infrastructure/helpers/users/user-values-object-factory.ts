import { IDConstants } from '@modules/user/domain/values-objects/uuid/id-constants';
import IDVO from '@modules/user/domain/values-objects/uuid/id-vo';
import { ValueObject } from '@modules/user/domain/values-objects/value-object';
import {
  AvatarConstants,
  EmailConstants,
  NameConstants,
  PhoneNumberConstants,
  UsernameConstants,
} from '@user/domain/values-objects/user/constants';

import {
  AvatarVO,
  EmailVO,
  NameVO,
  PhoneNumberVO,
  UsernameVO,
} from '@user/domain/values-objects/user/values-object';

type UserValuesObjectKey =
  | 'userId'
  | 'name'
  | 'username'
  | 'email'
  | 'phonenumber'
  | 'avatar';

export class UserValuesObjectFactory {
  static optionalObjects: Record<UserValuesObjectKey, ValueObject> = {
    userId: new IDVO(IDConstants.EXEMPLE),
    name: new NameVO(NameConstants.EXEMPLE, false),
    username: new UsernameVO(UsernameConstants.EXEMPLE, false),
    email: new EmailVO(EmailConstants.EXEMPLE, false),
    phonenumber: new PhoneNumberVO(PhoneNumberConstants.EXEMPLE, false),
    avatar: new AvatarVO(AvatarConstants.EXEMPLE, false),
  };

  static requiredObjects: Record<UserValuesObjectKey, ValueObject> = {
    userId: new IDVO(IDConstants.EXEMPLE),
    name: new NameVO(NameConstants.EXEMPLE, true),
    username: new UsernameVO(UsernameConstants.EXEMPLE, true),
    email: new EmailVO(EmailConstants.EXEMPLE, true),
    phonenumber: new PhoneNumberVO(PhoneNumberConstants.EXEMPLE, true),
    avatar: new AvatarVO(AvatarConstants.EXEMPLE, true),
  };

  static getObjects(
    requiredKeys: UserValuesObjectKey[],
    optionalKeys: UserValuesObjectKey[],
  ): Partial<Record<UserValuesObjectKey, ValueObject>> {
    const output: Partial<Record<UserValuesObjectKey, ValueObject>> = {};

    requiredKeys.forEach((key) => {
      output[key] = this.requiredObjects[key];
    });

    optionalKeys.forEach((key) => {
      output[key] = this.optionalObjects[key];
    });

    return output;
  }
}
