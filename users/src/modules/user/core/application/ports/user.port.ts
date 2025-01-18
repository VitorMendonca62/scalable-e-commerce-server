import { UserLogin } from '../../domain/user-login.entity';
import { UserUpdate } from '../../domain/user-update.entity';
import { User } from '../../domain/user.entity';

export abstract class CreateUserPort {
  abstract execute(user: User): Promise<void>;
}

export abstract class GetUserPort {
  abstract findById(id: string): Promise<User>;
  abstract findByUsername(username: string): Promise<User>;
}

export abstract class GetUsersPort {
  abstract findAll(): Promise<User[]>;
}

export abstract class UpdateUserPort {
  abstract execute(id: string, newUser: UserUpdate): Promise<User>;
}

export abstract class DeleteUserPort {
  abstract execute(id: string): Promise<void>;
}

export abstract class TokenUserOutbondPort {
  accessToken: string;
  refreshToken: string;
}

export abstract class TokenUserPort {
  abstract login(user: UserLogin): Promise<TokenUserOutbondPort>;
  abstract getAccessToken(refreshToken: string): Promise<string>;
}
