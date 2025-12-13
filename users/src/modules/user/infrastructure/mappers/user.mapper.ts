import { User } from '@user/domain/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { CreateUserDTO } from '../adaptars/primary/http/dtos/create-user.dto';
import { defaultRoles } from '@user/domain/types/permissions';
import { UserEntity } from '../adaptars/secondary/database/entities/user.entity';
import { UserUpdate } from '@user/domain/entities/user-update.entity';
import { UpdateUserDTO } from '../adaptars/primary/http/dtos/update-user.dto';
import { v7 } from 'uuid';
import IDVO from '@user/domain/values-objects/uuid/id-vo';
import {
  AvatarVO,
  EmailVO,
  NameVO,
  PhoneNumberVO,
  UsernameVO,
} from '@modules/user/domain/values-objects/user/values-object';
import { isEmpty } from 'class-validator';

@Injectable()
export class UserMapper {
  createDTOForModel(dto: CreateUserDTO, userId: string) {
    const dateNow = new Date();

    return new User({
      userId: new IDVO(userId),
      name: new NameVO(dto.name, true),
      username: new UsernameVO(dto.username, true),
      email: new EmailVO(dto.email, true),
      phonenumber: new PhoneNumberVO(dto.phonenumber, true),
      active: true,
      email_verified: false,
      phone_verified: false,
      avatar: new AvatarVO(null, false),
      roles: defaultRoles,
      createdAt: dateNow,
      updatedAt: dateNow,
    });
  }

  updateDTOForModel(dto: UpdateUserDTO, userId: string): UserUpdate {
    const props: any = {
      userId: new IDVO(userId),
      updatedAt: new Date(),
    };

    if (!isEmpty(dto.name)) props.name = new NameVO(dto.name, false);
    if (!isEmpty(dto.username))
      props.username = new UsernameVO(dto.username, false);
    if (!isEmpty(dto.email)) props.email = new EmailVO(dto.email, false);
    if (!isEmpty(dto.avatar)) props.avatar = new AvatarVO(dto.avatar, false);
    if (!isEmpty(dto.phonenumber))
      props.phonenumber = new PhoneNumberVO(dto.phonenumber, false);

    return new UserUpdate(props);
  }

  userUpdateModelForJSON(user: UserUpdate): Record<keyof UserUpdate, any> {
    const returned: any = {
      userId: user.userId.getValue(),
      updatedAt: user.updatedAt,
    };

    if (!isEmpty(user.avatar)) returned.avatar = user.avatar.getValue();
    if (!isEmpty(user.email)) returned.email = user.email.getValue();
    if (!isEmpty(user.name)) returned.name = user.name.getValue();
    if (!isEmpty(user.phonenumber))
      returned.phonenumber = user.phonenumber.getValue();
    if (!isEmpty(user.username)) returned.username = user.username.getValue();

    return returned;
  }

  userModelToJSON(user: User): UserEntity {
    return {
      _id: user._id,
      userId: user.userId.getValue(),
      name: user.name.getValue(),
      username: user.username.getValue(),
      email: user.email.getValue(),
      avatar: user.avatar.getValue(),
      active: user.active,
      email_verified: user.email_verified,
      phone_verified: user.phone_verified,
      phonenumber: user.phonenumber.getValue(),
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
