import { Injectable } from '@nestjs/common';
import { CreateUserDTO } from '@auth/adaptars/primary/http/dto/create-user.dto';
import { User } from '@auth/core/domain/user.entity';
import { LoginUserDTO } from '@auth/adaptars/primary/http/dto/login-user.dto';
import { UserLogin } from '@auth/core/domain/user-login.entity';

@Injectable()
export class UserMapper {
  createDTOForEntity(dto: CreateUserDTO) {
    const createdAt = new Date();
    const updatedAt = new Date();

    return new User(dto, createdAt, updatedAt);
  }

  loginDTOForEntity(dto: LoginUserDTO) {
    return new UserLogin(dto);
  }
}
