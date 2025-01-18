import { Injectable } from '@nestjs/common';
import { CreateUserDTO } from '@auth/adaptars/primary/http/dto/create-user.dto';
import { User } from '@modules/auth/core/domain/entities/user.entity';
import { LoginUserDTO } from '@auth/adaptars/primary/http/dto/login-user.dto';
import { UserLogin } from '@modules/auth/core/domain/entities/user-login.entity';

@Injectable()
export class UserMapper {
  createDTOForEntity(dto: CreateUserDTO) {
    return new User(dto);
  }

  loginDTOForEntity(dto: LoginUserDTO) {
    return new UserLogin(dto);
  }
}
