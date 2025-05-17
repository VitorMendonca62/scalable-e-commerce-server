import { CreateUserDTO } from '../adaptars/primary/http/dtos/create-user.dto';
import { LoginUserDTO } from '../adaptars/primary/http/dtos/login-user.dto';
import { UserLogin } from '../core/domain/entities/user-login.entity';
import { User } from '../core/domain/entities/user.entity';

interface MockUser extends CreateUserDTO {
  _id?: string;
}

export const mockUser = (overrides: Partial<MockUser> = {}) => {
  const user = new User(mockCreateUserDTO(overrides));

  if (overrides._id) {
    user._id = overrides._id;
  }

  return user;
};

export const mockLoginUser = (overrides: Partial<MockUser> = {}) => {
  return new UserLogin(mockLoginUserDTO(overrides));
};

export const mockLoginUserDTO = (
  overrides: Partial<LoginUserDTO> = {},
): LoginUserDTO => {
  return {
    email: 'exemple@exemple.com',
    password: '@Vh1234567',
    ...overrides,
  };
};

export const mockCreateUserDTO = (
  overrides: Partial<CreateUserDTO> = {},
): CreateUserDTO => {
  return {
    username: 'vitormendonca62',
    email: 'exemple@exemple.com',
    name: 'Default user',
    password: '@Vh1234567',
    phonenumber: '+5581999999999',
    ...overrides,
  };
};

export const mockUserList = () => {
  return [
    mockUser({ username: 'user01', _id: '1', email: 'exemple1@exemple.com' }),
    mockUser({ username: 'user02', _id: '2', email: 'exemple2@exemple.com' }),
    mockUser({ username: 'user03', _id: '3', email: 'exemple3@exemple.com' }),
  ];
};
