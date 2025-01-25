import { UserUpdate } from '../../../domain/entities/user-update.entity';
import { User } from '../../../domain/entities/user.entity';

export abstract class CreateUserPort {
  abstract execute(user: User): Promise<void>;
}

export abstract class GetUserPort {
  abstract findById(id: string): Promise<User>;
  abstract findByUsername(username: string): Promise<User>;
}

export abstract class GetUsersPort {
  abstract getAll(): Promise<User[]>;
}

export abstract class UpdateUserPort {
  abstract execute(id: string, newUser: UserUpdate): Promise<User>;
}

export abstract class DeleteUserPort {
  abstract execute(id: string): Promise<void>;
}
