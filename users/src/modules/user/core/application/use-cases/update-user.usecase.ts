import { UserUpdate } from '../../domain/entities/user-update.entity';
import { User } from '../../domain/entities/user.entity';
import { UpdateUserPort } from '../ports/primary/user.port';

export class UpdateUserUseCase implements UpdateUserPort {
  execute(id: string, newUser: UserUpdate): Promise<User> {
    throw new Error('Method not implemented.');
  }
}
