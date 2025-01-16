import { User } from '../../domain/user.entity';
import { GetUsersPort } from '../ports/user.port';

export class GetUsersUseCase implements GetUsersPort {
  findAll(): Promise<User[]> {
    throw new Error('Method not implemented.');
  }
}
