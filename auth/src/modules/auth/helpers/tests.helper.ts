import { CreateUserDTO } from '../adaptars/primary/http/dto/create-user.dto';
import { LoginUserDTO } from '../adaptars/primary/http/dto/login-user.dto';
import { UserLogin } from '../core/domain/entities/user-login.entity';
import { User } from '../core/domain/entities/user.entity';

interface MockUser extends CreateUserDTO {
  id?: string;
}

export const mockUser = (overrides: Partial<MockUser> = {}) => {
  return new User(mockCreateUserDTO(overrides));
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
