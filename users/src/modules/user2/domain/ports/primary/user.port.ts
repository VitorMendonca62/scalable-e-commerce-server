import { UserEntity } from '@user/infrastructure/adaptars/secondary/database/entities/user.entity';
import { Address } from '@user/domain/entities/address.entity';
import { User } from '../../entities/user.entity';
import UsernameVO from '../../values-objects/user/username/username-vo';

export abstract class CreateUserPort {
  abstract execute(user: User): Promise<void>;
}

export abstract class GetUserPort {
  abstract findById(id: string): Promise<UserEntity>;
  abstract findByUsername(username: string): Promise<UserEntity>;
}

export abstract class GetUsersPort {
  abstract getAll(): Promise<UserEntity[]>;
}

export abstract class UpdateUserPort {
  abstract execute(
    id: string,
    newFields: Record<string, any>,
  ): Promise<UserEntity>;
}

export abstract class DeleteUserPort {
  abstract execute(id: string): Promise<void>;
}

export abstract class CreateUserAddressPort {
  abstract execute(id: string, address: Address): Promise<void>;
}
