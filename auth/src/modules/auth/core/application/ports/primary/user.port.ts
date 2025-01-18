import { User } from '../../../domain/entities/user.entity';

export abstract class CreateUserPort {
  abstract execute(user: User): Promise<void>;
}
