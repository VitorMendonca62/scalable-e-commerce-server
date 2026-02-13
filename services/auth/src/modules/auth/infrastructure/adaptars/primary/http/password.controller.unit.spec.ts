import {
  EmailConstants,
  PasswordConstants,
} from '@auth/domain/values-objects/constants';
import { HttpStatus } from '@nestjs/common';
import { PasswordController } from './password.controller';

import IDConstants from '@auth/domain/values-objects/id/id-constants';
import { HttpOKResponse } from '@auth/domain/ports/primary/http/sucess.port';
import { ChangePasswordUseCase } from '@auth/application/use-cases/change-password.usecase';
import CookieService from '../../secondary/cookie-service/cookie.service';
import { Cookies } from '@auth/domain/enums/cookies.enum';
import ValidateCodeForForgotPasswordUseCase from '@auth/application/use-cases/validate-code-for-forgot-password.usecase';
import SendCodeForForgotPasswordUseCase from '@auth/application/use-cases/send-code-for-forgot-password.usecase';
import { FastifyReply } from 'fastify';
import { UpdatePasswordDTOFactory } from '@auth/infrastructure/helpers/tests/dtos-factory';
import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';
import {
  FieldInvalid,
  NotFoundUser,
  WrongCredentials,
} from '@auth/domain/ports/primary/http/errors.port';

describe('PasswordController', () => {
  let controller: PasswordController;

  let sendCodeForForgotPasswordUseCase: SendCodeForForgotPasswordUseCase;
  let validateCodeForForgotPasswordUseCase: ValidateCodeForForgotPasswordUseCase;
  let changePasswordUseCase: ChangePasswordUseCase;
  let cookiesService: CookieService;

  beforeEach(async () => {
    sendCodeForForgotPasswordUseCase = { execute: vi.fn() } as any;
    validateCodeForForgotPasswordUseCase = { execute: vi.fn() } as any;
    changePasswordUseCase = {
      executeReset: vi.fn(),
      executeUpdate: vi.fn(),
    } as any;
    cookiesService = { setCookie: vi.fn() } as any;

    controller = new PasswordController(
      sendCodeForForgotPasswordUseCase,
      validateCodeForForgotPasswordUseCase,
      changePasswordUseCase,
      cookiesService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(sendCodeForForgotPasswordUseCase).toBeDefined();
    expect(validateCodeForForgotPasswordUseCase).toBeDefined();
    expect(changePasswordUseCase).toBeDefined();
    expect(cookiesService).toBeDefined();
  });

  describe('sendCode', () => {
    const email = EmailConstants.EXEMPLE;
    const dto = { email };

    it('should call sendCodeForForgotPasswordUseCase.execute with email', async () => {
      vi.spyOn(sendCodeForForgotPasswordUseCase, 'execute').mockResolvedValue({
        ok: true,
      });

      await controller.sendCode(dto);

      expect(sendCodeForForgotPasswordUseCase.execute).toHaveBeenCalledWith(
        email,
      );
    });

    it('should return HttpOKResponse on success', async () => {
      vi.spyOn(sendCodeForForgotPasswordUseCase, 'execute').mockResolvedValue({
        ok: true,
      });

      const result = await controller.sendCode(dto);

      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message:
          'Código de recuperação enviado com sucesso. Verifique seu email.',
      });
    });

    it('should throw error if createSessionUseCase throws error', async () => {
      vi.spyOn(sendCodeForForgotPasswordUseCase, 'execute').mockRejectedValue(
        new Error('Erro no use case'),
      );

      try {
        await controller.sendCode(dto);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('validateCode', () => {
    let response: FastifyReply;
    const email = EmailConstants.EXEMPLE;
    const code = 'AAAAAA';
    const dto = { email, code };

    beforeEach(() => {
      response = {
        status: vi.fn().mockReturnThis(),
      } as any;

      vi.spyOn(
        validateCodeForForgotPasswordUseCase,
        'execute',
      ).mockResolvedValue({
        ok: true,
        result: 'token',
      });
    });

    it('should call validCodeForForgotPasswordUseCase.execute with email and code', async () => {
      await controller.validateCode(dto, response);

      expect(validateCodeForForgotPasswordUseCase.execute).toHaveBeenCalledWith(
        code,
        email,
      );
    });

    it('should store reset token in cookie on success', async () => {
      await controller.validateCode(dto, response);

      expect(cookiesService.setCookie).toHaveBeenCalledWith(
        Cookies.ResetPassToken,
        'token',
        600000,
        response,
      );
    });

    it('should return HttpOKResponse on code and email are valid', async () => {
      const result = await controller.validateCode(dto, response);

      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Seu código de recuperação de senha foi validado com sucesso.',
      });
    });

    it('should return FieldInvalid when reason error is invalid code', async () => {
      vi.spyOn(
        validateCodeForForgotPasswordUseCase,
        'execute',
      ).mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.FIELD_INVALID,
        message: 'message',
      });

      const result = await controller.validateCode(dto, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(FieldInvalid);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'message',
        data: 'code',
      });
    });

    it('should throw error if validateCodeForForgotPasswordUseCase throws error', async () => {
      vi.spyOn(
        validateCodeForForgotPasswordUseCase,
        'execute',
      ).mockRejectedValue(new Error('Erro no use case'));

      try {
        await controller.validateCode(dto, response);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('resetPassword', () => {
    const email = EmailConstants.EXEMPLE;
    const newPassword = PasswordConstants.EXEMPLE;
    const dto = { newPassword };

    let response: FastifyReply;

    beforeEach(() => {
      response = {
        status: vi.fn().mockReturnThis(),
        redirect: vi.fn().mockReturnThis(),
      } as any;
    });

    it('should call changePasswordUseCase.executeReset with email and new password', async () => {
      vi.spyOn(changePasswordUseCase, 'executeReset').mockResolvedValue({
        ok: true,
      });

      await controller.resetPassword(dto, response, email);

      expect(changePasswordUseCase.executeReset).toHaveBeenCalledWith(
        email,
        newPassword,
      );
    });

    it('should redirect on success', async () => {
      vi.spyOn(changePasswordUseCase, 'executeReset').mockResolvedValue({
        ok: true,
      });

      await controller.resetPassword(dto, response, email);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.SEE_OTHER);
      expect(response.redirect).toHaveBeenCalledWith(
        'https://github.com/VitorMendonca62',
      );
    });

    it('should return WrongCredentials on NOT_FOUND', async () => {
      vi.spyOn(changePasswordUseCase, 'executeReset').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Credenciais inválidas',
      });

      const result = await controller.resetPassword(dto, response, email);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(result).toBeInstanceOf(WrongCredentials);
      expect(result).toEqual({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Credenciais inválidas',
      });
    });

    it('should throw error if changePasswordUseCase throws error', async () => {
      const response = {
        status: vi.fn().mockReturnThis(),
        redirect: vi.fn(),
      } as any;

      vi.spyOn(changePasswordUseCase, 'executeReset').mockRejectedValue(
        new Error('Erro no use case'),
      );

      try {
        await controller.resetPassword(dto, response, email);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('updatePassword', () => {
    const updatePasswordDTOFactory = new UpdatePasswordDTOFactory();
    const dto = updatePasswordDTOFactory.likeInstance();
    const userID = IDConstants.EXEMPLE;
    let response: FastifyReply;

    beforeEach(() => {
      response = {
        status: vi.fn().mockReturnThis(),
        redirect: vi.fn().mockReturnThis(),
      } as any;
    });

    it('should call changePasswordUseCase.executeUpdate with userId and passwords', async () => {
      vi.spyOn(changePasswordUseCase, 'executeUpdate').mockResolvedValue({
        ok: true,
      });

      await controller.updatePassword(dto, userID, response);

      expect(changePasswordUseCase.executeUpdate).toHaveBeenCalledWith(
        IDConstants.EXEMPLE,
        dto.newPassword,
        dto.oldPassword,
      );
    });

    it('should return HttpOKResponse on success', async () => {
      vi.spyOn(changePasswordUseCase, 'executeUpdate').mockResolvedValue({
        ok: true,
      });

      const result = await controller.updatePassword(dto, userID, response);

      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'A senha do usuário foi atualizada!',
      });
    });

    it('should return NotFoundUser when user not found', async () => {
      vi.spyOn(changePasswordUseCase, 'executeUpdate').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
      });

      const result = await controller.updatePassword(dto, userID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(result).toBeInstanceOf(NotFoundUser);
      expect(result).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Usuário não encontrado.',
      });
    });

    it('should return FieldInvalid on invalid password', async () => {
      vi.spyOn(changePasswordUseCase, 'executeUpdate').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.FIELD_INVALID,
        messsage: 'Senha inválida',
        result: 'oldPassword',
      });

      const result = await controller.updatePassword(dto, userID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(FieldInvalid);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Senha inválida',
        data: 'oldPassword',
      });
    });
  });
});
