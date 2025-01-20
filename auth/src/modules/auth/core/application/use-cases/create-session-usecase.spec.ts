import { InMemoryUserRepository } from '@modules/auth/adaptars/secondary/database/repositories/inmemory-user.repository';
import { mockLoginUser, mockUser } from '@modules/auth/helpers/tests.helper';
import { TestingModule, Test } from '@nestjs/testing';
import { UserRepository } from '../ports/secondary/user-repository.interface';
import { JwtTokenService } from '../services/jwt-token.service';
import { CreateSessionUseCase } from './create-session.usecase';
import { ConfigModule } from '@nestjs/config';

describe('CreateSessionUseCase', () => {
  let useCase: CreateSessionUseCase;

  let userRepository: UserRepository;
  let tokenService: JwtTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        CreateSessionUseCase,
        JwtTokenService,
        {
          provide: UserRepository,
          useClass: InMemoryUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateSessionUseCase>(CreateSessionUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
    tokenService = module.get<JwtTokenService>(JwtTokenService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(tokenService).toBeDefined();
  });

  describe('execute', () => {
    const user = mockUser({ id: 'USERID' });
    const userLogin = mockLoginUser();

    beforeEach(() => {
      jest
        .spyOn(userRepository, 'findByEmail')
        .mockImplementation(async () => user);

      jest
        .spyOn(tokenService, 'generateRefreshToken')
        .mockImplementation(() => 'TOKEN');

      jest
        .spyOn(tokenService, 'generateAccessToken')
        .mockImplementation(() => 'TOKEN');

      jest.spyOn(user, 'validatePassword').mockImplementation(() => true);
    });

    it('should use case call with correct parameters and create user session', async () => {
      const response = await useCase.execute(userLogin);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(userLogin.email);
      expect(user.validatePassword).toHaveBeenCalledWith(userLogin.password);
      expect(tokenService.generateAccessToken).toHaveBeenCalledWith({
        sub: user._id,
        email: user.email,
        roles: user.roles,
        type: 'access',
      });

      expect(tokenService.generateRefreshToken).toHaveBeenCalledWith({
        sub: user._id,
        type: 'refresh',
      });
      expect(response).toEqual({
        accessToken: 'Bearer TOKEN',
        refreshToken: 'Bearer TOKEN',
        type: 'Bearer',
      });
    });

    it('should throw not found exception when user does not exists', async () => {
      jest
        .spyOn(userRepository, 'findByEmail')
        .mockImplementation(async () => undefined);

      await expect(useCase.execute(userLogin)).rejects.toThrow(
        'Email ou senha estão incorretos.',
      );
    });

    it('should throw not found exception when password is incorrect', async () => {
      jest.spyOn(user, 'validatePassword').mockImplementation(() => false);

      await expect(useCase.execute(userLogin)).rejects.toThrow(
        'Email ou senha estão incorretos.',
      );
    });
  });
});
