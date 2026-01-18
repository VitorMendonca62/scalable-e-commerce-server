import { HttpStatus } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { CreateSessionUseCase } from '@auth/application/use-cases/create-session.usecase';
import { GetAccessTokenUseCase } from '@auth/application/use-cases/get-access-token.usecase';
import {
  mockGoogleLogin,
  mockLoginUser,
  mockLoginUserDTO,
  mockUserGoogleInCallBack,
  mockUserModel,
} from '@auth/infrastructure/helpers/tests/user-mocks';
import { UserMapper } from '@auth/infrastructure/mappers/user.mapper';
import {
  HttpCreatedResponse,
  HttpNoContentResponse,
  HttpOKResponse,
} from '@auth/domain/ports/primary/http/sucess.port';
import { Request, Response } from 'express';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';
import { FinishSessionUseCase } from '@auth/application/use-cases/finish-session.usecase';
import { Cookies } from '@auth/domain/enums/cookies.enum';
import CookieService from '@auth/infrastructure/adaptars/secondary/cookie-service/cookie.service';
import { ConfigService } from '@nestjs/config';
import { UsersQueueService } from '../../secondary/message-broker/rabbitmq/users_queue/users-queue.service';
import { EnvironmentVariables } from '@config/environment/env.validation';

describe('AuthController', () => {
  let controller: AuthController;

  let createSessionUseCase: CreateSessionUseCase;
  let getAccessTokenUseCase: GetAccessTokenUseCase;
  let finishSessionUseCase: FinishSessionUseCase;
  let cookieService: CookieService;
  let configService: ConfigService<EnvironmentVariables>;
  let usersQueueService: UsersQueueService;

  let userMapper: UserMapper;

  let request: Request;
  let response: Response;

  beforeEach(async () => {
    userMapper = {
      loginDTOForEntity: jest.fn(),
      googleLoginDTOForEntity: jest.fn(),
    } as any;
    createSessionUseCase = {
      execute: jest.fn(),
      executeWithGoogle: jest.fn(),
    } as any;
    getAccessTokenUseCase = { execute: jest.fn() } as any;
    finishSessionUseCase = { execute: jest.fn() } as any;
    cookieService = { setCookie: jest.fn() } as any;
    configService = { get: jest.fn() } as any;
    usersQueueService = { send: jest.fn() } as any;

    controller = new AuthController(
      userMapper,
      createSessionUseCase,
      getAccessTokenUseCase,
      finishSessionUseCase,
      cookieService,
      configService,
      usersQueueService,
    );

    response = {
      clearCookie: jest.fn(),
    } as any;
  });

  const userID = IDConstants.EXEMPLE;
  const tokenID = `token-${IDConstants.EXEMPLE}`;

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(createSessionUseCase).toBeDefined();
    expect(userMapper).toBeDefined();
    expect(getAccessTokenUseCase).toBeDefined();
    expect(finishSessionUseCase).toBeDefined();
    expect(cookieService).toBeDefined();
    expect(configService).toBeDefined();
    expect(usersQueueService).toBeDefined();
  });

  describe('getGoogleURL', () => {
    const redirectUri = 'http://localhost/callback';
    const clientID = IDConstants.EXEMPLE;

    beforeEach(() => {
      jest
        .spyOn(configService, 'get')
        .mockReturnValueOnce('http://localhost/callback');
      jest.spyOn(configService, 'get').mockReturnValueOnce(IDConstants.EXEMPLE);
    });

    it('should return oauth2 google url ', () => {
      const result = controller.getGoogleURL();

      expect(configService.get).toHaveBeenNthCalledWith(
        1,
        'GOOGLE_CALLBACK_URL',
      );
      expect(configService.get).toHaveBeenNthCalledWith(2, 'GOOGLE_CLIENT_ID');

      expect(result).toBe(
        `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=${redirectUri}&scope=email%20profile&client_id=${clientID}`,
      );
    });
  });

  describe('googleAuthRedirect', () => {
    const user = mockUserModel();
    const userGoogleInCallback: UserGoogleInCallBack =
      mockUserGoogleInCallBack();
    const ip = '120.0.0.0';

    beforeEach(() => {
      request = {
        user: userGoogleInCallback,
      } as any;

      jest
        .spyOn(userMapper, 'googleLoginDTOForEntity')
        .mockReturnValue(mockGoogleLogin());

      jest.spyOn(createSessionUseCase, 'executeWithGoogle').mockResolvedValue({
        result: {
          accessToken: `<accessToken>`,
          refreshToken: `<refreshToken>`,
        },
        newUser: undefined,
      });
    });

    it('should call createSessionUseCase.executeWithGoogle with mapped DTO', async () => {
      await controller.googleAuthRedirect(request, response, ip);

      expect(userMapper.googleLoginDTOForEntity).toHaveBeenCalledWith(
        userGoogleInCallback,
        ip,
      );
      expect(createSessionUseCase.executeWithGoogle).toHaveBeenCalledWith(
        mockGoogleLogin(),
      );
    });

    it('should call userQueueService.send with fields for create user in other service', async () => {
      jest.spyOn(createSessionUseCase, 'executeWithGoogle').mockResolvedValue({
        result: {
          accessToken: `<accessToken>`,
          refreshToken: `<refreshToken>`,
        },
        newUser: user,
      });

      await controller.googleAuthRedirect(request, response, ip);

      expect(usersQueueService.send).toHaveBeenCalledWith(
        'user-create-google',
        {
          userID: user.userID,
          name: 'test',
          username: 'test',
          email: user.email,
          roles: user.roles,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      );
    });

    it('should set access token and refresh token on cookies', async () => {
      await controller.googleAuthRedirect(request, response, ip);

      expect(cookieService.setCookie).toHaveBeenNthCalledWith(
        1,
        Cookies.RefreshToken,
        '<refreshToken>',
        604800000,
        response,
      );
      expect(cookieService.setCookie).toHaveBeenNthCalledWith(
        2,
        Cookies.AccessToken,
        '<accessToken>',
        3600000,
        response,
      );
    });

    it('should return HttpCreatedResponse on success', async () => {
      const result = await controller.googleAuthRedirect(request, response, ip);

      expect(result).toBeInstanceOf(HttpCreatedResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Usuário realizou login com sucesso',
      });
    });

    it('should throw error if createSessionUseCase throws error', async () => {
      jest
        .spyOn(createSessionUseCase, 'executeWithGoogle')
        .mockRejectedValue(new Error('Erro no use case'));

      try {
        await controller.googleAuthRedirect(request, response, ip);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
        expect(error.data).toBeUndefined();
      }
    });

    it('should throw error if userMapper.googleLoginDTOForEntity throws error', async () => {
      jest
        .spyOn(userMapper, 'googleLoginDTOForEntity')
        .mockImplementation(() => {
          throw new Error('Erro no mapper');
        });

      try {
        await controller.googleAuthRedirect(request, response, ip);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no mapper');
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('login', () => {
    const user = mockLoginUser();
    const dto = mockLoginUserDTO();
    const ip = '120.0.0.0';

    beforeEach(() => {
      jest.spyOn(userMapper, 'loginDTOForEntity').mockReturnValue(user);

      jest.spyOn(createSessionUseCase, 'execute').mockResolvedValue({
        accessToken: `<accessToken>`,
        refreshToken: `<refreshToken>`,
      });
    });

    it('should call createSessionUseCase.execute with mapped DTO', async () => {
      await controller.login(dto, response, ip);

      expect(userMapper.loginDTOForEntity).toHaveBeenCalledWith(dto, ip);
      expect(createSessionUseCase.execute).toHaveBeenCalledWith(user);
    });

    it('should set access token and refresh token on cookies', async () => {
      await controller.login(dto, response, ip);

      expect(cookieService.setCookie).toHaveBeenNthCalledWith(
        1,
        Cookies.RefreshToken,
        '<refreshToken>',
        604800000,
        response,
      );
      expect(cookieService.setCookie).toHaveBeenNthCalledWith(
        2,
        Cookies.AccessToken,
        '<accessToken>',
        3600000,
        response,
      );
    });

    it('should return HttpCreatedResponse on success', async () => {
      const result = await controller.login(dto, response, ip);

      expect(result).toBeInstanceOf(HttpCreatedResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Usuário realizou login com sucesso',
      });
    });

    it('should throw error if createSessionUseCase throws error', async () => {
      jest
        .spyOn(createSessionUseCase, 'execute')
        .mockRejectedValue(new Error('Erro no use case'));

      try {
        await controller.login(dto, response, ip);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
        expect(error.data).toBeUndefined();
      }
    });

    it('should throw error if userMapper.loginDTOForEntity throws error', async () => {
      jest.spyOn(userMapper, 'loginDTOForEntity').mockImplementation(() => {
        throw new Error('Erro no mapper');
      });

      try {
        await controller.login(dto, response, ip);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no mapper');
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('getAccessToken', () => {
    beforeEach(() => {
      jest
        .spyOn(getAccessTokenUseCase, 'execute')
        .mockResolvedValue('<accessToken>');
    });

    it('should call getAccessToken.execute with userId and tokenid', async () => {
      await controller.getAccessToken(response, userID, tokenID);

      expect(getAccessTokenUseCase.execute).toHaveBeenCalledWith(
        userID,
        tokenID,
      );
    });

    it('should set access token on cookies', async () => {
      await controller.getAccessToken(response, userID, tokenID);

      expect(cookieService.setCookie).toHaveBeenCalledWith(
        Cookies.AccessToken,
        '<accessToken>',
        3600000,
        response,
      );
    });

    it('should return HttpOKResponse on success', async () => {
      const result = await controller.getAccessToken(response, userID, tokenID);

      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Seu token de acesso foi renovado',
      });
    });

    it('should throw error if getAccessTokenUseCase throws error', async () => {
      jest
        .spyOn(getAccessTokenUseCase, 'execute')
        .mockRejectedValue(new Error('Erro no use case'));

      try {
        await controller.getAccessToken(response, userID, tokenID);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('logout', () => {
    it('should call finishSessionUseCase.execute with userId and tokenid', async () => {
      await controller.logout(response, userID, tokenID);

      expect(finishSessionUseCase.execute).toHaveBeenCalledWith(
        tokenID,
        userID,
      );
    });

    it('should clear access token and refresh_token on cookies', async () => {
      await controller.logout(response, userID, tokenID);

      expect(response.clearCookie).toHaveBeenNthCalledWith(1, 'refresh_token');
      expect(response.clearCookie).toHaveBeenNthCalledWith(2, 'access_token');
    });

    it('should return HttpNoContentResponse on success', async () => {
      const result = await controller.logout(response, userID, tokenID);

      expect(result).toBeInstanceOf(HttpNoContentResponse);
    });

    it('should throw error if finishSessionUseCase throws error', async () => {
      jest
        .spyOn(finishSessionUseCase, 'execute')
        .mockRejectedValue(new Error('Erro no use case'));

      try {
        await controller.logout(response, userID, tokenID);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
        expect(error.data).toBeUndefined();
      }
    });
  });
});
