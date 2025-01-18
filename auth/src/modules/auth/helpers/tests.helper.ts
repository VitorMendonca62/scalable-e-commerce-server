import { CreateUserDTO } from '../adaptars/primary/http/dto/create-user.dto';
import { User } from '../core/domain/entities/user.entity';

interface MockUser extends CreateUserDTO {
  id?: string;
}

export const mockUser = (overrides: Partial<MockUser> = {}) => {
  const createdAt = new Date('2025-01-16T17:21:05.370Z');
  const updatedAt = new Date('2025-01-16T17:21:05.370Z');

  return new User(mockCreatUserDTO(overrides), createdAt, updatedAt);
};

export const mockCreatUserDTO = (
  overrides: Partial<CreateUserDTO> = {},
): CreateUserDTO => {
  return {
    username: 'defaultuser',
    email: 'exemple@exemple.com',
    name: 'Default user',
    password: '@Vh1234567',
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
