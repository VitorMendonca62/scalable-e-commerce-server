import { User } from '../../../domain/entities/user.entity';

export interface CreateUserPort {
  execute(user: User): Promise<void>;
}
