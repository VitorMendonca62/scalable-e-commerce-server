import { User } from '../../domain/entities/user.entity';
import { GetUsersPort } from '../ports/primary/user.port';

export class GetUsersUseCase implements GetUsersPort {
  findAll(): Promise<User[]> {
    throw new Error('Method not implemented.');
  }
}
