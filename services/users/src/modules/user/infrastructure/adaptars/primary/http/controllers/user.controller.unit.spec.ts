import { IDConstants } from '@modules/user/domain/values-objects/common/constants';

import {
  CreateUserUseCase,
  DeleteUserUseCase,
  GetUserUseCase,
  UpdateUserUseCase,
  ValidateEmailUseCase,
} from '@modules/user/application/use-cases/user/use-cases';
import { UserMapper } from '@user/infrastructure/mappers/user.mapper';
import { UserController } from './user.controller';
import { HttpStatus } from '@nestjs/common';
import {
  UserDTOFactory,
  UserFactory,
  UserUpdateFactory,
} from '@modules/user/infrastructure/helpers/users/factory';
import CookieService from '../services/cookie/cookie.service';
import { FastifyReply } from 'fastify';
import { TokenExpirationConstants } from '@modules/user/domain/constants/token-expirations';
import { Cookies } from '@modules/user/domain/enums/cookies.enum';
import {
  EmailConstants,
  UsernameConstants,
} from '@modules/user/domain/values-objects/user/constants';
import {
  HttpCreatedResponse,
  HttpOKResponse,
} from '@modules/user/domain/ports/primary/http/sucess.port';
import { v7 } from 'uuid';
import {
  BusinessRuleFailure,
  FieldAlreadyExists,
  FieldInvalid,
  NotFoundItem,
} from '@modules/user/domain/ports/primary/http/error.port';
import { ApplicationResultReasons } from '@modules/user/domain/enums/application-result-reasons';
import { UsersQueueService } from '../../../secondary/message-broker/rabbitmq/users_queue/users-queue.service';

describe('UserController', () => {
  let controller: UserController;

  let userMapper: UserMapper;
  let cookieService: CookieService;
  let usersQueueService: UsersQueueService;

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

    cookieService = {
      setCookie: vi.fn(),
    } as any;

    usersQueueService = {
      send: vi.fn(),
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
      cookieService,
      usersQueueService,
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
    expect(cookieService).toBeDefined();
    expect(usersQueueService).toBeDefined();
    expect(validateEmailUseCase).toBeDefined();
    expect(createUserUseCase).toBeDefined();
    expect(getUserUseCase).toBeDefined();
    expect(updateUserUseCase).toBeDefined();
    expect(deleteUserUseCase).toBeDefined();
  });

  describe('sendCode', () => {
    const dto = UserDTOFactory.createValidateEmailDTO();

    it('should call validateEmailUseCase.sendEmail with email', async () => {
      await controller.sendCode(dto, response);

      expect(validateEmailUseCase.sendEmail).toHaveBeenCalledWith(dto.email);
    });

    it('should redirect for otp code screen with see other status', async () => {
      await controller.sendCode(dto, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.SEE_OTHER);
      expect(response.redirect).toHaveBeenCalledWith(
        'https://github.com/VitorMendonca62',
      );
    });

    it('should rethrow error if usecase throw error', async () => {
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

    it('should redirect for signup screen with see other status on sucess', async () => {
      await controller.validateCode(dto, response);
      expect(response.status).toHaveBeenCalledWith(HttpStatus.SEE_OTHER);
      expect(response.redirect).toHaveBeenCalledWith(
        'https://github.com/VitorMendonca62',
      );
    });

    it('should set signup cookie on sucess', async () => {
      await controller.validateCode(dto, response);

      expect(cookieService.setCookie).toHaveBeenCalledWith(
        Cookies.SignUpToken,
        token,
        TokenExpirationConstants.SIGN_UP_TOKEN_MS,
        response,
      );
    });

    it('should return BusinessRuleFailure if use case result is not ok', async () => {
      vi.spyOn(validateEmailUseCase, 'validateCode').mockResolvedValue({
        ok: false,
        message: 'any',
        reason: ApplicationResultReasons.BUSINESS_RULE_FAILURE,
      });

      const result = await controller.validateCode(dto, response);

      expect(response.status).toBeCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(BusinessRuleFailure);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'any',
        data: undefined,
      });
    });

    it('should rethrow error if usecase throw error', async () => {
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

    beforeAll(() => {
      vi.mock('uuid', () => {
        return { v7: vi.fn().mockReturnValue(IDConstants.EXEMPLE) };
      });
    });

    beforeEach(() => {
      vi.spyOn(createUserUseCase, 'execute').mockResolvedValue({
        ok: true,
        result: {
          createdAt: userModel.createdAt,
          roles: userModel.roles,
          updatedAt: userModel.updatedAt,
        },
      });
      vi.spyOn(userMapper, 'createDTOForEntity').mockReturnValue(userEntity);
    });

    it('should call userMapper.createDTOForEntity with correct parameters', async () => {
      await controller.create(dto, email, response);

      expect(userMapper.createDTOForEntity).toHaveBeenCalledWith(
        dto,
        email,
        userID,
      );
    });

    it('should call createUserUseCase.execute with correct parameters', async () => {
      await controller.create(dto, email, response);

      expect(v7).toBeCalled();
      expect(createUserUseCase.execute).toHaveBeenCalledWith(userEntity);
    });

    it('should send user-created event with correct payload', async () => {
      await controller.create(dto, email, response);

      expect(usersQueueService.send).toHaveBeenCalledWith('user-created', {
        userID,
        email: email,
        password: dto.password,
        phoneNumber: dto.phoneNumber,
        roles: userModel.roles,
        createdAt: userModel.createdAt,
        updatedAt: userModel.updatedAt,
      });
    });

    it('should return HttpCreatedResponse on success', async () => {
      const result = await controller.create(dto, email, response);

      expect(response.status).toBeCalledWith(HttpStatus.CREATED);
      expect(result).toBeInstanceOf(HttpCreatedResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Usuário criado com sucesso',
        data: undefined,
      });
    });

    it('should return FieldAlreadyExists if use case result is not ok', async () => {
      vi.spyOn(createUserUseCase, 'execute').mockResolvedValue({
        ok: false,
        message: 'any',
        result: 'email',
        reason: ApplicationResultReasons.FIELD_ALREADY_EXISTS,
      });

      const result = await controller.create(dto, email, response);

      expect(response.status).toBeCalledWith(HttpStatus.CONFLICT);
      expect(result).toBeInstanceOf(FieldAlreadyExists);
      expect(result).toEqual({
        statusCode: HttpStatus.CONFLICT,
        message: 'any',
        data: 'email',
      });
    });

    it('should rethrow error if usecase throw error', async () => {
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
    const resultUser = {
      name: userModel.name,
      username: userModel.username,
      email: userModel.email,
      avatar: userModel.avatar,
      phoneNumber: userModel.phoneNumber,
    };

    beforeEach(() => {
      vi.spyOn(getUserUseCase, 'execute').mockResolvedValue({
        ok: true,
        result: resultUser,
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

    it('should return HttpOKResponse on success with user', async () => {
      const result = await controller.findOne(identifier, response);

      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Usuário encontrado com sucesso',
        data: resultUser,
      });
    });

    it('should return NotFoundItem if use case result is not ok', async () => {
      vi.spyOn(getUserUseCase, 'execute').mockResolvedValue({
        ok: false,
        message: 'any',
        reason: ApplicationResultReasons.NOT_FOUND,
      });

      const result = await controller.findOne(identifier, response);

      expect(response.status).toBeCalledWith(HttpStatus.NOT_FOUND);
      expect(result).toBeInstanceOf(NotFoundItem);
      expect(result).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
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

    it('should return HttpOKResponse on success', async () => {
      const result = await controller.update(dto, userID, response);

      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Usuário atualizado com sucesso',
        data: dto,
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

    it('should return FieldAlreadyExists if use case result is not ok and reason is FIELD_ALREADY_EXISTS', async () => {
      vi.spyOn(updateUserUseCase, 'execute').mockResolvedValue({
        ok: false,
        message: 'any message',
        reason: ApplicationResultReasons.FIELD_ALREADY_EXISTS,
        result: 'username',
      });

      const result = await controller.update(dto, userID, response);

      expect(response.status).toBeCalledWith(HttpStatus.CONFLICT);
      expect(result).toBeInstanceOf(FieldAlreadyExists);
      expect(result).toEqual({
        statusCode: HttpStatus.CONFLICT,
        message: 'any message',
        data: 'username',
      });
    });

    it('should rethrow error if usecase throw error', async () => {
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

    it('should return NotFoundItem if use case result is not ok and reason is NOT_FOUND', async () => {
      vi.spyOn(updateUserUseCase, 'execute').mockResolvedValue({
        ok: false,
        message: 'any message',
        reason: ApplicationResultReasons.NOT_FOUND,
      });

      const result = await controller.update(dto, userID, response);

      expect(response.status).toBeCalledWith(HttpStatus.NOT_FOUND);
      expect(result).toBeInstanceOf(NotFoundItem);
      expect(result).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'any message',
        data: undefined,
      });
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

    it('should return HttpDeletedResponse on success', async () => {
      const result = await controller.delete(userID, response);

      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Usuário deletado com sucesso',
        data: undefined,
      });
    });

    it('should return NotFoundItem if use case result is not ok ', async () => {
      vi.spyOn(deleteUserUseCase, 'execute').mockResolvedValue({
        ok: false,
        message: 'any message',
        reason: ApplicationResultReasons.NOT_FOUND,
      });

      const result = await controller.delete(userID, response);

      expect(response.status).toBeCalledWith(HttpStatus.NOT_FOUND);
      expect(result).toBeInstanceOf(NotFoundItem);
      expect(result).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'any message',
        data: undefined,
      });
    });

    it('should rethrow error if usecase throw error', async () => {
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
