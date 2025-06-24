import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { GetAccessTokenUseCase } from './get-access-token';
import { TokenService } from '@modules/auth/domain/ports/primary/session.port';
import { UserRepository } from '@modules/auth/domain/ports/secondary/user-repository.port';
import { InMemoryUserRepository } from '@modules/auth/infrastructure/adaptars/secondary/database/repositories/inmemory-user.repository';
import { JwtTokenService } from '@modules/auth/infrastructure/adaptars/secondary/token-service/jwt-token.service';
import { mockUser } from '@modules/auth/infrastructure/helpers/tests.helper';
import { WrongCredentials } from '@modules/auth/domain/ports/primary/http/errors.port';

describe('GetAccessTokenUseCase', () => {
  let useCase: GetAccessTokenUseCase;

  let userRepository: UserRepository;
  let tokenService: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        GetAccessTokenUseCase,
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

    useCase = module.get<GetAccessTokenUseCase>(GetAccessTokenUseCase);
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
    const refreshToken = 'REFRESHTOKEN';
    const accessToken = 'Bearer ACCESSTOKEN';

    beforeEach(() => {
      jest
        .spyOn(tokenService, 'generateAccessToken')
        .mockImplementation(() => accessToken);

      jest.spyOn(tokenService, 'verifyToken').mockImplementation(() => {
        return { sub: 'USERID' };
      });
    });

    it('should use case call with correct parameters and return token', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockImplementation(async () => user);

      const response = await useCase.execute(refreshToken);

      expect(userRepository.findOne).toHaveBeenCalledWith({ _id: user._id });
      expect(tokenService.generateAccessToken).toHaveBeenCalledWith(user);
      expect(tokenService.verifyToken).toHaveBeenCalledWith(refreshToken);
      expect(response).toBe(accessToken);
    });

    it('should throw bad request exception when user does not exist', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockImplementation(async () => undefined);

      await expect(useCase.execute(refreshToken)).rejects.toThrow(
        new WrongCredentials('Token inválido ou expirado'),
      );
    });
  });
});
