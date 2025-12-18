// Decorators
import { Injectable } from '@nestjs/common';

// DTO's
import { LoginUserDTO } from '../adaptars/primary/http/dtos/login-user.dto';

// VO's
import EmailVO from '@auth/domain/values-objects/email/email-vo';
import IDVO from '@auth/domain/values-objects/id/id-vo';
import PasswordVO from '@auth/domain/values-objects/password/password-vo';
import PhoneNumberVO from '@auth/domain/values-objects/phone-number/phone-number-vo';

// Entities
import { UserLogin } from '@auth/domain/entities/user-login.entity';
import { User } from '@auth/domain/entities/user.entity';

// Models
import { UserModel } from '../adaptars/secondary/database/models/user.model';

// Dependeces
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import PasswordHashedVO from '@auth/domain/values-objects/password-hashed/password-hashed-vo';

// Function
@Injectable()
export class UserMapper {
  constructor(private passwordHasher: PasswordHasher) {}
  loginDTOForEntity(dto: LoginUserDTO): UserLogin {
    return new UserLogin({
      email: new EmailVO(dto.email),
      password: new PasswordVO(dto.password, this.passwordHasher),
    });
  }

  jsonToUser(json: UserModel): User {
    return new User({
      userID: new IDVO(json.userID),
      email: new EmailVO(json.email),
      password: new PasswordHashedVO(json.password, this.passwordHasher),
      phoneNumber: new PhoneNumberVO(json.phoneNumber),
      roles: json.roles,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt,
    });
  }
}
