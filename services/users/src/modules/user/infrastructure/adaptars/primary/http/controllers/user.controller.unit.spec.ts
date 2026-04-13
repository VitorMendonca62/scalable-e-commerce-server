import { IDConstants } from '@user/domain/values-objects/common/constants';

import {
  CreateUserUseCase,
  DeleteUserUseCase,
  GetUserUseCase,
  UpdateUserUseCase,
  ValidateEmailUseCase,
} from '@user/application/use-cases/user/use-cases';
import { UserMapper } from '@user/infrastructure/mappers/user.mapper';
import { UserController } from './user.controller';
import { HttpStatus } from '@nestjs/common';
import {
  UserDTOFactory,
  UserFactory,
  UserUpdateFactory,
} from '@user/infrastructure/helpers/users/factory';
import { FastifyReply } from 'fastify';
import { Cookies } from '@user/domain/enums/cookies.enum';
import {
  EmailConstants,
  UsernameConstants,
} from '@user/domain/values-objects/user/constants';
import {
  HttpCreatedResponse,
  HttpOKResponse,
} from '@user/domain/ports/primary/http/sucess.port';
import { ApplicationResultReasons } from '@user/domain/enums/application-result-reasons';
import QueueService from '../../../secondary/message-broker/queue.service';
import UseCaseResultToHttpMapper from '@user/infrastructure/mappers/use-case-result-to-http.mapper';
import {
  FieldInvalid,
  NotPossible,
} from '@user/domain/ports/primary/http/error.port';

describe('UserController', () => {
  let controller: UserController;

  let userMapper: UserMapper;
  let useCaseResultToHttpMapper: UseCaseResultToHttpMapper;
  let queueService: QueueService;

  let validateEmailUseCase: ValidateEmailUseCase;
  let createUserUseCase: CreateUserUseCase;
  let getUserUseCase: GetUserUseCase;
  let updateUserUseCase: UpdateUserUseCase;
  let deleteUserUseCase: DeleteUserUseCase;

  let response: FastifyReply;

  beforeEach(async () => {
    userMapper = {
      createDTOForEntity: vi.fn(),
      updateDTOForModel: vi.fn(),
    } as any;
    useCaseResultToHttpMapper = {
      map: vi.fn(),
    } as any;

    queueService = {
      sendUserCreated: vi.fn(),
      sendUserUpdated: vi.fn(),
      sendUserDeleted: vi.fn(),
    } as any;

    validateEmailUseCase = {
      sendEmail: vi.fn(),
      validateCode: vi.fn(),
    } as any;
    createUserUseCase = { execute: vi.fn() } as any;
    getUserUseCase = { execute: vi.fn() } as any;
    updateUserUseCase = { execute: vi.fn() } as any;
    deleteUserUseCase = { execute: vi.fn() } as any;

    controller = new UserController(
      userMapper,
      queueService,
      useCaseResultToHttpMapper,
      validateEmailUseCase,
      createUserUseCase,
      getUserUseCase,
      updateUserUseCase,
      deleteUserUseCase,
    );

    response = {
      redirect: vi.fn().mockReturnValue(response),
      status: vi.fn().mockReturnValue(response),
    } as any;

    vi.spyOn(response, 'status').mockReturnValue({
      redirect: response.redirect,
    } as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(userMapper).toBeDefined();
    expect(queueService).toBeDefined();
    expect(validateEmailUseCase).toBeDefined();
    expect(createUserUseCase).toBeDefined();
    expect(getUserUseCase).toBeDefined();
    expect(updateUserUseCase).toBeDefined();
    expect(deleteUserUseCase).toBeDefined();
  });

  describe('sendCode', () => {
    const dto = UserDTOFactory.createValidateEmailDTO();

    it('should call validateEmailUseCase.sendEmail with email', async () => {
      vi.spyOn(validateEmailUseCase, 'sendEmail').mockResolvedValue({
        ok: true,
      });
      await controller.sendCode(dto, response);

      expect(validateEmailUseCase.sendEmail).toHaveBeenCalledWith(dto.email);
    });

    it('should return OK response when use case succeeds', async () => {
      const useCaseResult = {
        ok: true as const,
      };
      vi.spyOn(validateEmailUseCase, 'sendEmail').mockResolvedValue(
        useCaseResult,
      );

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(
          new HttpOKResponse('Código enviado com sucesso para seu email.'),
        );

      const result = await controller.sendCode(dto, response);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        expect.any(HttpOKResponse),
        response,
      );
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Código enviado com sucesso para seu email.',
        data: undefined,
      });
    });

    it('should return NotPossible or other when use case fails', async () => {
      const useCaseResult = {
        ok: false as const,
        message: 'any',
        reason: ApplicationResultReasons.NOT_POSSIBLE as const,
      };
      vi.spyOn(validateEmailUseCase, 'sendEmail').mockResolvedValue(
        useCaseResult,
      );

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(new NotPossible('any'));

      const result = await controller.sendCode(dto, response);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpOKResponse('Código enviado com sucesso para seu email.'),
        response,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'any',
        data: undefined,
      });
    });

    it('should propagate error when use case throws', async () => {
      vi.spyOn(validateEmailUseCase, 'sendEmail').mockRejectedValue(
        new Error('Error'),
      );

      try {
        await controller.sendCode(dto, response);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error');
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('validateCode', () => {
    const dto = UserDTOFactory.createValidateCodeForValidateEmailDTO();
    const token = 'TOKEN';

    beforeEach(() => {
      vi.spyOn(validateEmailUseCase, 'validateCode').mockResolvedValue({
        ok: true,
        result: token,
      });
    });

    it('should call validateEmailUseCase.validateCode with email and code', async () => {
      await controller.validateCode(dto, response);

      expect(validateEmailUseCase.validateCode).toHaveBeenCalledWith(
        dto.code,
        dto.email,
      );
    });

    it('should return OK response when use case succeeds', async () => {
      const useCaseResult = {
        ok: true as const,
        result: token,
      };

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(
          new HttpOKResponse('Código validado com sucesso..', {
            [Cookies.SignUpToken]: token,
          }),
        );

      const result = await controller.validateCode(dto, response);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpOKResponse('Código validado com sucesso.', {
          [Cookies.SignUpToken]: token,
        }),
        response,
      );
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Código validado com sucesso..',
        data: { [Cookies.SignUpToken]: token },
      });
    });

    it('should return NotPossible or other when use case fails', async () => {
      const useCaseResult = {
        ok: false as const,
        message: 'any',
        reason: ApplicationResultReasons.NOT_POSSIBLE as const,
      };

      vi.spyOn(validateEmailUseCase, 'validateCode').mockResolvedValue(
        useCaseResult,
      );

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(new NotPossible('any'));

      const result = await controller.validateCode(dto, response);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpOKResponse('Código validado com sucesso.', {
          [Cookies.SignUpToken]: null,
        }),
        response,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'any',
        data: undefined,
      });
    });

    it('should propagate error when use case throws', async () => {
      vi.spyOn(validateEmailUseCase, 'validateCode').mockRejectedValue(
        new Error('Error'),
      );

      try {
        await controller.validateCode(dto, response);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error');
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('create', () => {
    const dto = UserDTOFactory.createCreateUserDTO();
    const email = EmailConstants.EXEMPLE;

    const userID = IDConstants.EXEMPLE;
    const userModel = UserFactory.createModel();
    const userEntity = UserFactory.createEntity();

    const useCaseResultUser = {
      createdAt: userModel.createdAt,
      roles: userModel.roles,
      updatedAt: userModel.updatedAt,
      password: 'hashedPassword',
    };

    beforeAll(() => {
      vi.mock('uuid', () => {
        return { v7: vi.fn().mockReturnValue(IDConstants.EXEMPLE) };
      });
    });

    beforeEach(() => {
      vi.spyOn(createUserUseCase, 'execute').mockResolvedValue({
        ok: true,
        result: useCaseResultUser,
      });
      vi.spyOn(userMapper, 'createDTOForEntity').mockReturnValue(userEntity);
    });

    it('should call createUserUseCase.execute with correct parameters', async () => {
      await controller.create(dto, email, response);

      expect(createUserUseCase.execute).toHaveBeenCalledWith(
        userEntity,
        dto.password,
      );
    });

    it('should send user-created event with correct payload', async () => {
      await controller.create(dto, email, response);

      expect(queueService.sendUserCreated).toHaveBeenCalledWith({
        userID,
        email: email,
        password: 'hashedPassword',
        roles: userModel.roles,
        createdAt: userModel.createdAt,
        updatedAt: userModel.updatedAt,
      });
    });

    it('should return created response when use case succeeds', async () => {
      const useCaseResult = {
        ok: true as const,
        result: useCaseResultUser,
      };

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(new HttpCreatedResponse('Usuário criado com sucesso'));

      const result = await controller.create(dto, email, response);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpCreatedResponse('Usuário criado com sucesso'),
        response,
      );
      expect(result).toBeInstanceOf(HttpCreatedResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Usuário criado com sucesso',
        data: undefined,
      });
    });

    it('should return NotPossible or other when use case fails', async () => {
      const useCaseResult = {
        ok: false as const,
        message: 'any',
        reason: ApplicationResultReasons.NOT_POSSIBLE as const,
      };

      vi.spyOn(createUserUseCase, 'execute').mockResolvedValue(useCaseResult);

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(new NotPossible('any'));

      const result = await controller.create(dto, email, response);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpCreatedResponse('Usuário criado com sucesso'),
        response,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'any',
        data: undefined,
      });
    });

    it('should propagate error when use case throws', async () => {
      vi.spyOn(createUserUseCase, 'execute').mockRejectedValue(
        new Error('Error'),
      );

      try {
        await controller.create(dto, email, response);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error');
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('findOne', () => {
    const identifier = UsernameConstants.EXEMPLE;
    const userModel = UserFactory.createModel();
    const useCaseResultUser = {
      name: userModel.name,
      username: userModel.username,
      email: userModel.email,
      avatar: userModel.avatar,
      phoneNumber: userModel.phoneNumber,
    };

    beforeEach(() => {
      vi.spyOn(getUserUseCase, 'execute').mockResolvedValue({
        ok: true,
        result: useCaseResultUser,
      });
    });

    it('should call getUserUseCase.execute if identifier is not uuid', async () => {
      await controller.findOne(identifier, response);

      expect(getUserUseCase.execute).toHaveBeenCalledWith(
        identifier,
        'username',
      );
    });

    it('should call getUserUseCase.execute if identifier is uuid', async () => {
      await controller.findOne(IDConstants.EXEMPLE, response);

      expect(getUserUseCase.execute).toHaveBeenCalledWith(
        IDConstants.EXEMPLE,
        'userID',
      );
    });
    it('should return ok response when use case succeeds', async () => {
      const useCaseResult = {
        ok: true as const,
        result: useCaseResultUser,
      };

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(
          new HttpOKResponse(
            'Usuário encontrado com sucesso',
            useCaseResultUser,
          ),
        );

      const result = await controller.findOne(identifier, response);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpOKResponse('Usuário encontrado com sucesso', useCaseResultUser),
        response,
      );
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Usuário encontrado com sucesso',
        data: useCaseResultUser,
      });
    });

    it('should return NotPossible or other when use case fails', async () => {
      const useCaseResult = {
        ok: false as const,
        message: 'any',
        reason: ApplicationResultReasons.NOT_POSSIBLE as const,
      };

      vi.spyOn(getUserUseCase, 'execute').mockResolvedValue(useCaseResult);

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(new NotPossible('any'));

      const result = await controller.findOne(identifier, response);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpOKResponse('Usuário encontrado com sucesso', null),
        response,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'any',
        data: undefined,
      });
    });
  });

  describe('update', () => {
    const userID = IDConstants.EXEMPLE;
    const dto = UserDTOFactory.createUpdateUserDTO();
    const userUpdate = UserUpdateFactory.createEntity();

    vi.mock('@user/domain/values-objects/uuid/id-validator');

    beforeEach(() => {
      vi.spyOn(userMapper, 'updateDTOForModel').mockReturnValue(userUpdate);
      vi.spyOn(updateUserUseCase, 'execute').mockResolvedValue({
        ok: true,
      });
    });

    it('should call updateUserUseCase.execute with correct parameters and mapped user', async () => {
      await controller.update(dto, userID, response);

      expect(updateUserUseCase.execute).toHaveBeenCalledWith(
        userID,
        userUpdate,
      );
    });

    it('should return ok response when use case succeeds', async () => {
      const useCaseResult = {
        ok: true as const,
      };

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(
          new HttpOKResponse('Usuário atualizado com sucesso', dto),
        );

      const result = await controller.update(dto, userID, response);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpOKResponse('Usuário atualizado com sucesso', dto),
        response,
      );
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Usuário atualizado com sucesso',
        data: dto,
      });
    });

    it('should return NotPossible or other when use case fails', async () => {
      const useCaseResult = {
        ok: false as const,
        message: 'any',
        reason: ApplicationResultReasons.NOT_POSSIBLE as const,
      };

      vi.spyOn(updateUserUseCase, 'execute').mockResolvedValue(useCaseResult);

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(new NotPossible('any'));

      const result = await controller.update(dto, userID, response);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpOKResponse('Usuário atualizado com sucesso', null),
        response,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'any',
        data: undefined,
      });
    });

    it('should return FieldInvalid when no have fields', async () => {
      const result = await controller.update({}, userID, response);

      expect(response.status).toBeCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(FieldInvalid);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Adicione algum campo para o usuário ser atualizado',
        data: 'all',
      });
    });

    it('should return FieldInvalid when no have dto', async () => {
      const result = await controller.update(undefined, userID, response);

      expect(response.status).toBeCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(FieldInvalid);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Adicione algum campo para o usuário ser atualizado',
        data: 'all',
      });
    });

    it('should propagate error when use case throws', async () => {
      vi.spyOn(updateUserUseCase, 'execute').mockRejectedValue(
        new Error('Error'),
      );

      try {
        await controller.update(dto, userID, response);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error');
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('delete', () => {
    const userID = IDConstants.EXEMPLE;

    vi.mock('@user/domain/values-objects/uuid/id-validator');

    beforeEach(() => {
      vi.spyOn(deleteUserUseCase, 'execute').mockResolvedValue({ ok: true });
    });

    it('should call deleteUserUseCase.execute with user id', async () => {
      await controller.delete(userID, response);

      expect(deleteUserUseCase.execute).toHaveBeenCalledWith(userID);
    });

    it('should return ok response when use case succeeds', async () => {
      const useCaseResult = {
        ok: true as const,
      };

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(new HttpOKResponse('Usuário deletado com sucesso'));

      const result = await controller.delete(userID, response);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpOKResponse('Usuário deletado com sucesso'),
        response,
      );
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Usuário deletado com sucesso',
        data: undefined,
      });
    });

    it('should return NotPossible or other when use case fails', async () => {
      const useCaseResult = {
        ok: false as const,
        message: 'any',
        reason: ApplicationResultReasons.NOT_POSSIBLE as const,
      };

      vi.spyOn(deleteUserUseCase, 'execute').mockResolvedValue(useCaseResult);

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(new NotPossible('any'));

      const result = await controller.delete(userID, response);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpOKResponse('Usuário deletado com sucesso'),
        response,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'any',
        data: undefined,
      });
    });

    it('should propagate error when use case throws', async () => {
      vi.spyOn(deleteUserUseCase, 'execute').mockRejectedValue(
        new Error('Error'),
      );

      try {
        await controller.delete(userID, response);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error');
        expect(error.data).toBeUndefined();
      }
    });
  });
});
