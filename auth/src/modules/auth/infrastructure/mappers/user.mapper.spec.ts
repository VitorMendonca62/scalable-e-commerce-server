import { Test, TestingModule } from '@nestjs/testing';
import { UserMapper } from './user.mapper';
import { ConfigModule } from '@nestjs/config';
import { mockCreateUserDTO } from '../helpers/tests.helper';
import { User } from '@modules/auth/domain/entities/user.entity';
import { UserLogin } from '@modules/auth/domain/entities/user-login.entity';

describe('UserMapper', () => {
  let mapper: UserMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [UserMapper],
    }).compile();

    mapper = module.get<UserMapper>(UserMapper);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('createDTOForEntity', () => {
    const dto = mockCreateUserDTO();

    it('should return User with correct fields', async () => {
      const user = mapper.createDTOForEntity(dto);

      expect(user).toBeInstanceOf(User);
      expect(user.email.getValue()).toBe(dto.email);
      expect(user.name.getValue()).toBe(dto.name);
      expect(user.phonenumber.getValue()).toBe(dto.phonenumber);
      expect(user.username.getValue()).toBe(dto.username);
    });
  });

  describe('loginDTOForEntity', () => {
    const dto = mockCreateUserDTO();

    it('should return User with correct fields', async () => {
      const userLogin = mapper.loginDTOForEntity(dto);

      expect(userLogin).toBeInstanceOf(UserLogin);
      expect(userLogin.email.getValue()).toBe(dto.email);
    });
  });
});
