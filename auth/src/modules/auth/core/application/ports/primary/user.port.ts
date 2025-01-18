import { User } from '../../../domain/user.entity';

export abstract class CreateUserPort {
  abstract execute(user: User): Promise<void>;
}
