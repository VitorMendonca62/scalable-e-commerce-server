import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UpdateUserDTO } from '../../../adaptars/primary/http/dto/update-user.dto';
import { UserUpdate } from '../../domain/entities/user-update.entity';

@Injectable()
export class UserMapper {
  createDTOForEntity(user: User) {
    return new User(user);
  }

  updateDTOForEntity(dto: UpdateUserDTO) {
    return new UserUpdate(dto);
  }
}
