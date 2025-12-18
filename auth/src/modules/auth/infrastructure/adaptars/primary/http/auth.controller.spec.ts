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
import { Request } from 'express';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';

describe('AuthController', () => {
  let controller: AuthController;

  let createSessionUseCase: CreateSessionUseCase;
  let getAccessTokenUseCase: GetAccessTokenUseCase;

  let userMapper: UserMapper;

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
      jest.spyOn(createSessionUseCase, 'execute').mockResolvedValue({
        accessToken: `Bearer <accessToken>>`,
        refreshToken: `Bearer <refreshToken>`,
        type: 'Bearer',
      });
      jest.spyOn(userMapper, 'loginDTOForEntity').mockReturnValue(user);
    });

    it('should call createSessionUseCase.execute with mapped DTO', async () => {
      await controller.login(dto);

      expect(userMapper.loginDTOForEntity).toHaveBeenCalledWith(dto);
      expect(createSessionUseCase.execute).toHaveBeenCalledWith(user);
    });

    it('should return HttpCreatedResponse on success', async () => {
      const response = await controller.login(dto);

      expect(response).toBeInstanceOf(HttpCreatedResponse);
      expect(response).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Usuário realizou login com sucesso',
        data: {
          accessToken: `Bearer <accessToken>>`,
          refreshToken: `Bearer <refreshToken>`,
          type: 'Bearer',
        },
      });
    });

    it('should throw error if createSessionUseCase throws error', async () => {
      jest
        .spyOn(createSessionUseCase, 'execute')
        .mockRejectedValue(new Error('Erro no use case'));

      await expect(controller.login(dto)).rejects.toThrow('Erro no use case');
    });
  });

  describe('getAccessToken', () => {
    let request: Request;

    beforeEach(() => {
      jest
        .spyOn(getAccessTokenUseCase, 'execute')
        .mockResolvedValue('Bearer refreshToken');
      request = {
        user: {
          userID: IDConstants.EXEMPLE,
        },
      } as any;
    });

    it('should call getAccessToken.execute with userId', async () => {
      await controller.getAccessToken(request);

      expect(getAccessTokenUseCase.execute).toHaveBeenCalledWith(
        IDConstants.EXEMPLE,
      );
    });

    it('should return HttpOKResponse on success', async () => {
      const response = await controller.getAccessToken(request);

      expect(response).toBeInstanceOf(HttpOKResponse);
      expect(response).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Aqui está seu token de acesso',
        data: 'Bearer refreshToken',
      });
    });

    it('should throw error if getAccessTokenUseCase throws error', async () => {
      jest
        .spyOn(getAccessTokenUseCase, 'execute')
        .mockRejectedValue(new Error('Erro no use case'));

      await expect(controller.getAccessToken(request)).rejects.toThrow(
        'Erro no use case',
      );
    });
  });
});
