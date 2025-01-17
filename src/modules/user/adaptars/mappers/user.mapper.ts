import { Injectable } from '@nestjs/common';
import { CreateUserDTO } from '../primary/http/dto/create-user.dto';
import { User } from '../../core/domain/user.entity';
import { UpdateUserDTO } from '../primary/http/dto/update-user.dto';
import { UserUpdate } from '../../core/domain/user-update.entity';
import { LoginUserDTO } from '../primary/http/dto/login-user.dto';
import { UserLogin } from '@modules/user/core/domain/user-login.entity';

@Injectable()
export class UserMapper {
  createDTOForEntity(dto: CreateUserDTO) {
    const createdAt = new Date();
    const updatedAt = new Date();

    return new User(dto, createdAt, updatedAt);
  }

  updateDTOForEntity(dto: UpdateUserDTO) {
    const updatedAt = new Date();

    return new UserUpdate(dto, updatedAt);
  }

  loginDTOForEntity(dto: LoginUserDTO) {
    return new UserLogin(dto);
  }
}
