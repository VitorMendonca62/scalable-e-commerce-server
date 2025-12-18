import { HttpStatus } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { CreateSessionUseCase } from '@auth/application/use-cases/create-session.usecase';
import { GetAccessTokenUseCase } from '@auth/application/use-cases/get-access-token.usecase';
import {
  mockLoginUser,
  mockLoginUserDTO,
} from '@auth/infrastructure/helpers/tests/user-helper';
import { UserMapper } from '@auth/infrastructure/mappers/user.mapper';
import {
  HttpCreatedResponse,
  HttpOKResponse,
} from '@auth/domain/ports/primary/http/sucess.port';
import { Request, Response } from 'express';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';

describe('AuthController', () => {
  let controller: AuthController;

  let createSessionUseCase: CreateSessionUseCase;
  let getAccessTokenUseCase: GetAccessTokenUseCase;

  let userMapper: UserMapper;

  let response: Response;

  beforeEach(async () => {
    userMapper = {
      loginDTOForEntity: jest.fn(),
    } as any;
    createSessionUseCase = { execute: jest.fn() } as any;
    getAccessTokenUseCase = { execute: jest.fn() } as any;

    controller = new AuthController(
      userMapper,
      createSessionUseCase,
      getAccessTokenUseCase,
    );

    response = {
      cookie: jest.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(createSessionUseCase).toBeDefined();
    expect(userMapper).toBeDefined();
    expect(getAccessTokenUseCase).toBeDefined();
  });

  describe('login', () => {
    const user = mockLoginUser();
    const dto = mockLoginUserDTO();

    beforeEach(() => {
      jest.spyOn(userMapper, 'loginDTOForEntity').mockReturnValue(user);

      jest.spyOn(createSessionUseCase, 'execute').mockResolvedValue({
        accessToken: `Bearer <accessToken>`,
        refreshToken: `Bearer <refreshToken>`,
      });
    });

    it('should call createSessionUseCase.execute with mapped DTO', async () => {
      await controller.login(dto, response);

      expect(userMapper.loginDTOForEntity).toHaveBeenCalledWith(dto);
      expect(createSessionUseCase.execute).toHaveBeenCalledWith(user);
    });

    it('should set access token and refresh token on cookies', async () => {
      await controller.login(dto, response);

      expect(response.cookie).toHaveBeenNthCalledWith(
        1,
        'refresh_token',
        'Bearer <refreshToken>',
        {
          httpOnly: true,
          maxAge: 604800000,
          path: '/',
        },
      );
      expect(response.cookie).toHaveBeenLastCalledWith(
        'access_token',
        'Bearer <accessToken>',
        {
          httpOnly: true,
          maxAge: 3600000,
          path: '/',
        },
      );
    });

    it('should return HttpCreatedResponse on success', async () => {
      const result = await controller.login(dto, response);

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

      await expect(controller.login(dto, response)).rejects.toThrow(
        'Erro no use case',
      );
    });
  });

  describe('getAccessToken', () => {
    let request: Request;

    beforeEach(() => {
      jest
        .spyOn(getAccessTokenUseCase, 'execute')
        .mockResolvedValue('Bearer <accessToken>');
      request = {
        user: {
          userID: IDConstants.EXEMPLE,
        },
      } as any;
    });

    it('should call getAccessToken.execute with userId', async () => {
      await controller.getAccessToken(request, response);

      expect(getAccessTokenUseCase.execute).toHaveBeenCalledWith(
        IDConstants.EXEMPLE,
      );
    });

    it('should set access token on cookies', async () => {
      await controller.getAccessToken(request, response);

      expect(response.cookie).toHaveBeenCalledWith(
        'access_token',
        'Bearer <accessToken>',
        {
          httpOnly: true,
          maxAge: 1000 * 60 * 60,
          path: '/',
        },
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

      await expect(
        controller.getAccessToken(request, response),
      ).rejects.toThrow('Erro no use case');
    });
  });
});
