import { User } from '../../domain/user.entity';
import { CreateUserPort } from '../ports/user.port';

export class CreateUserUseCase implements CreateUserPort {
  execute(user: User): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
