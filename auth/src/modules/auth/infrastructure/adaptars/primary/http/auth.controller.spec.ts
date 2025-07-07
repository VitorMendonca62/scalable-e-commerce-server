import { HttpStatus } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { CreateSessionUseCase } from '@modules/auth/application/use-cases/create-session.usecase';
import { GetAccessTokenUseCase } from '@modules/auth/application/use-cases/get-access-token';
import { defaultRoles } from '@modules/auth/domain/types/permissions';
import { PubSubMessageBroker } from '@modules/auth/domain/ports/secondary/pub-sub.port';
import {
  mockUser,
  mockCreateUserDTO,
  mockLoginUser,
  mockLoginUserDTO,
} from '@modules/auth/infrastructure/helpers/tests/tests.helper';
import { UserMapper } from '@modules/auth/infrastructure/mappers/user.mapper';
import { CreateUserUseCase } from '@modules/auth/application/use-cases/create-user.usecase';
import {
  HttpCreatedResponse,
  HttpOKResponse,
} from '@modules/auth/domain/ports/primary/http/sucess.port';

describe('AuthController', () => {
  let controller: AuthController;

  let createUserUseCase: CreateUserUseCase;
  let createSessionUseCase: CreateSessionUseCase;
  let getAccessTokenUseCase: GetAccessTokenUseCase;

  let userMapper: UserMapper;

  let messageBrokerService: PubSubMessageBroker;

  beforeEach(async () => {
    userMapper = {
      createDTOForEntity: jest.fn(),
      loginDTOForEntity: jest.fn(),
    } as any;
    createUserUseCase = { execute: jest.fn() } as any;
    createSessionUseCase = { execute: jest.fn() } as any;
    getAccessTokenUseCase = { execute: jest.fn() } as any;
    messageBrokerService = { publish: jest.fn() } as any;

    controller = new AuthController(
      userMapper,
      createUserUseCase,
      createSessionUseCase,
      getAccessTokenUseCase,
      messageBrokerService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(createUserUseCase).toBeDefined();
    expect(createSessionUseCase).toBeDefined();
    expect(userMapper).toBeDefined();
    expect(getAccessTokenUseCase).toBeDefined();
    expect(messageBrokerService).toBeDefined();
  });

  describe('create', () => {
    const user = mockUser();
    const dto = mockCreateUserDTO();

    beforeEach(() => {
      jest.spyOn(createUserUseCase, 'execute').mockReturnValue(undefined);
      jest.spyOn(messageBrokerService, 'publish').mockReturnValue(undefined);
      jest.spyOn(userMapper, 'createDTOForEntity').mockReturnValue(user);
    });

    it('should call createUserUseCase.execute with mapped DTO', async () => {
      await controller.create(dto);

      expect(userMapper.createDTOForEntity).toHaveBeenCalledWith(dto);
      expect(createUserUseCase.execute).toHaveBeenCalledWith(user);
    });

    it('should publish user-created event with correct payload', async () => {
      await controller.create(dto);

      expect(messageBrokerService.publish).toHaveBeenCalledWith(
        'user-created',
        {
          email: dto.email,
          name: dto.name,
          roles: defaultRoles,
          username: dto.username,
          _id: '1',
          phonenumber: dto.phonenumber,
        },
        'auth',
      );
    });

    it('should return HttpCreatedResponse on success', async () => {
      const response = await controller.create(dto);

      expect(response).toBeInstanceOf(HttpCreatedResponse);
      expect(response).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Usuário criado com sucesso',
      });
    });

    it('should throw if use case throws', async () => {
      jest
        .spyOn(createUserUseCase, 'execute')
        .mockRejectedValue(new Error('Erro no use case'));

      await expect(controller.create(dto)).rejects.toThrow('Erro no use case');
    });
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

    it('should throw if use case throws', async () => {
      jest
        .spyOn(createSessionUseCase, 'execute')
        .mockRejectedValue(new Error('Erro no use case'));

      await expect(controller.login(dto)).rejects.toThrow('Erro no use case');
    });
  });

  describe('getAccessToken', () => {
    beforeEach(() => {
      jest
        .spyOn(getAccessTokenUseCase, 'execute')
        .mockResolvedValue('Bearer refreshToken');
    });

    it('should return HttpOKResponse on success', async () => {
      const response = await controller.getAccessToken('Bearer refreshToken');

      expect(response).toBeInstanceOf(HttpOKResponse);
      expect(response).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Aqui está seu token de acesso',
        data: 'Bearer refreshToken',
      });
    });

    it('should throw if use case throws', async () => {
      jest
        .spyOn(getAccessTokenUseCase, 'execute')
        .mockRejectedValue(new Error('Erro no use case'));

      await expect(
        controller.getAccessToken('Bearer refreshToken'),
      ).rejects.toThrow('Erro no use case');
    });
  });
});
