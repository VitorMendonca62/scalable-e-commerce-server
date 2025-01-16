import { UserUpdate } from '../../domain/user-update.entity';
import { User } from '../../domain/user.entity';
import { UpdateUserPort } from '../ports/user.port';

export class UpdateUserUseCase implements UpdateUserPort {
  execute(id: string, newUser: UserUpdate): Promise<User> {
    throw new Error('Method not implemented.');
  }
}
