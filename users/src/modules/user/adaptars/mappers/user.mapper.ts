import { Injectable } from '@nestjs/common';
import { User } from '../../core/domain/entities/user.entity';
import { UpdateUserDTO } from '../primary/http/dto/update-user.dto';
import { UserUpdate } from '../../core/domain/entities/user-update.entity';

@Injectable()
export class UserMapper {
  createDTOForEntity(user: User) {
    return new User(user);
  }

  updateDTOForEntity(dto: UpdateUserDTO) {
    return new UserUpdate(dto);
  }
}
