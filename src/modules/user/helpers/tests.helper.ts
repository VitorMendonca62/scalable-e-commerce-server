import { CreateUserDTO } from '../adaptars/primary/http/dto/create-user.dto';
import { UpdateUserDTO } from '../adaptars/primary/http/dto/update-user.dto';
import { UserUpdate } from '../core/domain/user-update.entity';
import { User } from '../core/domain/user.entity';

interface MockUser extends CreateUserDTO {
  id?: string;
}

export const mockUser = (overrides: Partial<MockUser> = {}) => {
  const createdAt = new Date('2025-01-16T17:21:05.370Z');
  const updatedAt = new Date('2025-01-16T17:21:05.370Z');

  return new User(mockCreateDTO(overrides), createdAt, updatedAt);
};

export const mockUserUpdate = (overrides: UpdateUserDTO) => {
  const updatedAt = new Date('2025-02-16T17:21:05.370Z');

  return new UserUpdate({ username: 'changeuser', ...overrides }, updatedAt);
};

export const mockCreateDTO = (
  overrides: Partial<CreateUserDTO> = {},
): CreateUserDTO => {
  return {
    username: 'defaultuser',
    email: 'exemple@exemple.com',
    name: 'Default user',
    password: '12345678',
    phonenumber: '+5581999999999',
    ...overrides,
  };
};

export const mockUserList = () => {
  return [
    mockUser({ username: 'user01', id: '1' }),
    mockUser({ username: 'user02', id: '2' }),
    mockUser({ username: 'user03', id: '3' }),
  ];
};
