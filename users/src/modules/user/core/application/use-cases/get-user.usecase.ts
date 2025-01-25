import { User } from '../../domain/entities/user.entity';
import { GetUserPort } from '../ports/primary/user.port';

export class GetUserUseCase implements GetUserPort {
  findById(id: string): Promise<User> {
    throw new Error('Method not implemented.');
  }
  findByUsername(username: string): Promise<User> {
    throw new Error('Method not implemented.');
  }
}
