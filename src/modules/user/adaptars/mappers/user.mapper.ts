import { Injectable } from '@nestjs/common';
import { CreateUserDTO } from '../primary/http/dto/create-user.dto';
import { User } from '../../core/domain/user.entity';

@Injectable()
export class UserMapper {
  create(dto: CreateUserDTO) {
    const createdAt = new Date();
    const updatedAt = new Date();

    return new User(dto, createdAt, updatedAt);
  }
}
