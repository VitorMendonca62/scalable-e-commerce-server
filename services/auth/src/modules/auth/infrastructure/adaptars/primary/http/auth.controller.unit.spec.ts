import { HttpStatus } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { CreateSessionUseCase } from '@auth/application/use-cases/create-session.usecase';
import { GetAccessTokenUseCase } from '@auth/application/use-cases/get-access-token.usecase';
import {
  mockLoginUser,
  mockLoginUserDTO,
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

describe('AuthController', () => {
  let controller: AuthController;

  let createSessionUseCase: CreateSessionUseCase;
  let getAccessTokenUseCase: GetAccessTokenUseCase;
  let finishSessionUseCase: FinishSessionUseCase;
  let cookieService: CookieService;

  let userMapper: UserMapper;

  let response: Response;

  beforeEach(async () => {
    userMapper = {
      loginDTOForEntity: jest.fn(),
    } as any;
    createSessionUseCase = { execute: jest.fn() } as any;
    getAccessTokenUseCase = { execute: jest.fn() } as any;
    finishSessionUseCase = { execute: jest.fn() } as any;
    cookieService = { setCookie: jest.fn() } as any;

    controller = new AuthController(
      userMapper,
      createSessionUseCase,
      getAccessTokenUseCase,
      finishSessionUseCase,
      cookieService,
    );

    response = {
      clearCookie: jest.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(createSessionUseCase).toBeDefined();
    expect(userMapper).toBeDefined();
    expect(getAccessTokenUseCase).toBeDefined();
    expect(finishSessionUseCase).toBeDefined();
    expect(cookieService).toBeDefined();
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
    let request: Request;

    beforeEach(() => {
      jest
        .spyOn(getAccessTokenUseCase, 'execute')
        .mockResolvedValue('<accessToken>');
      request = {
        user: {
          userID: IDConstants.EXEMPLE,
          tokenID: IDConstants.EXEMPLE,
        },
      } as any;
    });

    it('should call getAccessToken.execute with userId and tokenid', async () => {
      await controller.getAccessToken(request, response);

      expect(getAccessTokenUseCase.execute).toHaveBeenCalledWith(
        IDConstants.EXEMPLE,
        IDConstants.EXEMPLE,
      );
    });

    it('should set access token on cookies', async () => {
      await controller.getAccessToken(request, response);

      expect(cookieService.setCookie).toHaveBeenCalledWith(
        Cookies.AccessToken,
        'Bearer <accessToken>',
        3600000,
        response,
      );
    });

    it('should return HttpOKResponse on success', async () => {
      const result = await controller.getAccessToken(request, response);

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
        await controller.getAccessToken(request, response);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('logout', () => {
    let request: Request;

    beforeEach(() => {
      request = {
        user: {
          userID: IDConstants.EXEMPLE,
          tokenID: IDConstants.EXEMPLE,
        },
      } as any;
    });

    it('should call finishSessionUseCase.execute with userId and tokenid', async () => {
      await controller.logout(request, response);

      expect(finishSessionUseCase.execute).toHaveBeenCalledWith(
        IDConstants.EXEMPLE,
        IDConstants.EXEMPLE,
      );
    });

    it('should clear access token and refresh_token on cookies', async () => {
      await controller.logout(request, response);

      expect(response.clearCookie).toHaveBeenNthCalledWith(1, 'refresh_token');
      expect(response.clearCookie).toHaveBeenNthCalledWith(2, 'access_token');
    });

    it('should return HttpNoContentResponse on success', async () => {
      const result = await controller.logout(request, response);

      expect(result).toBeInstanceOf(HttpNoContentResponse);
    });

    it('should throw error if finishSessionUseCase throws error', async () => {
      jest
        .spyOn(finishSessionUseCase, 'execute')
        .mockRejectedValue(new Error('Erro no use case'));

      try {
        await controller.logout(request, response);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
        expect(error.data).toBeUndefined();
      }
    });
  });
});
