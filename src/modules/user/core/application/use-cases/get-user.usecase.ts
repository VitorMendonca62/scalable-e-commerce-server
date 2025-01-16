import { User } from '../../domain/user.entity';
import { GetUserPort } from '../ports/user.port';

export class GetUserUseCase implements GetUserPort {
  findById(id: string): Promise<User> {
    throw new Error('Method not implemented.');
  }
  findByUsername(username: string): Promise<User> {
    throw new Error('Method not implemented.');
  }
}
