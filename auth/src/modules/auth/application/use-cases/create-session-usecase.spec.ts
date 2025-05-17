import { TokenService } from '@modules/auth/domain/ports/primary/session.port';
import { UserRepository } from '@modules/auth/domain/ports/secondary/user-repository.port';
import { InMemoryUserRepository } from '@modules/auth/infrastructure/adaptars/secondary/database/repositories/inmemory-user.repository';
import { JwtTokenService } from '@modules/auth/infrastructure/adaptars/secondary/token-service/jwt-token.service';
import {
  mockUser,
  mockLoginUser,
} from '@modules/auth/infrastructure/helpers/tests.helper';
import { BadRequestException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TestingModule, Test } from '@nestjs/testing';
import { CreateSessionUseCase } from './create-session.usecase';

describe('CreateSessionUseCase', () => {
  let useCase: CreateSessionUseCase;

  let userRepository: UserRepository;
  let tokenService: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        CreateSessionUseCase,
        {
          provide: UserRepository,
          useClass: InMemoryUserRepository,
        },
        {
          provide: TokenService,
          useClass: JwtTokenService,
        },
      ],
    }).compile();

    useCase = module.get<CreateSessionUseCase>(CreateSessionUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
    tokenService = module.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(tokenService).toBeDefined();
  });

  describe('execute', () => {
    const user = mockUser({ _id: 'USERID' });
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

      jest
        .spyOn(user.password, 'comparePassword')
        .mockImplementation(() => true);
    });

    it('should use case call with correct parameters and create user session', async () => {
      const response = await useCase.execute(userLogin);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        userLogin.email.getValue(),
      );
      expect(user.password.comparePassword).toHaveBeenCalledWith(
        userLogin.password.getValue(),
      );
      expect(tokenService.generateAccessToken).toHaveBeenCalledWith(user);

      expect(tokenService.generateRefreshToken).toHaveBeenCalledWith('USERID');
      expect(response).toEqual({
        accessToken: 'Bearer TOKEN',
        refreshToken: 'Bearer TOKEN',
        type: 'Bearer',
      });
    });

    it('should throw bad request exception when user does not exists', async () => {
      jest
        .spyOn(userRepository, 'findByEmail')
        .mockImplementation(async () => undefined);

      await expect(useCase.execute(userLogin)).rejects.toThrow(
        new BadRequestException('Email ou senha estão incorretos.'),
      );
    });

    it('should throw bad request exception when password is incorrect', async () => {
      jest
        .spyOn(user.password, 'comparePassword')
        .mockImplementation(() => false);

      await expect(useCase.execute(userLogin)).rejects.toThrow(
        new BadRequestException('Email ou senha estão incorretos.'),
      );
    });
  });
});
