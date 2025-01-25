import { UpdateUserDTO } from '../adaptars/primary/http/dto/update-user.dto';
import { CreateUserDTO } from '../adaptars/primary/microservices/dto/create-user.dto';
import { UserUpdate } from '../core/domain/entities/user-update.entity';
import { User } from '../core/domain/entities/user.entity';
import { Permissions } from '../core/domain/types/permissions';

export const mockCreatUserDTO = (
  overrides: Partial<CreateUserDTO> = {},
): CreateUserDTO => {
  return {
    _id: 'wadwadqwad',
    username: 'defaultuser',
    email: 'exemple@exemple.com',
    name: 'Default user',
    password: '12345678',
    phonenumber: '+5581999999999',
    createdAt: new Date('2025-02-16T17:21:05.370Z'),
    updatedAt: new Date('2025-02-16T17:21:05.370Z'),
    roles: [Permissions.READ_BOOKS, Permissions.ENTER],
    ...overrides,
  };
};

export const mockUser = (overrides: Partial<CreateUserDTO> = {}) => {
  return new User(mockCreatUserDTO(overrides));
};

export const mockUserUpdate = (overrides: UpdateUserDTO | object = {}) => {
  return new UserUpdate(
    mockUpdateUserDTO(overrides),
    new Date('2025-02-16T17:21:05.370Z'),
  );
};

export const mockUpdateUserDTO = (overrides: UpdateUserDTO | object = {}) => {
  return {
    username: 'changeuser',
    ...overrides,
  };
};

export const mockUserList = () => {
  return [
    mockUser({ username: 'user01', _id: '1' }),
    mockUser({ username: 'user02', _id: '2' }),
    mockUser({ username: 'user03', _id: '3' }),
  ];
};
