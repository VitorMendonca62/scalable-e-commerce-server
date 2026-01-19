import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { HttpStatus } from '@nestjs/common';
import { PasswordController } from './password.controller';

import { PasswordConstants } from '@auth/domain/values-objects/password/password-constants';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';
import { HttpOKResponse } from '@auth/domain/ports/primary/http/sucess.port';
import { ChangePasswordUseCase } from '@auth/application/use-cases/change-password.usecase';
import CookieService from '../../secondary/cookie-service/cookie.service';
import { Cookies } from '@auth/domain/enums/cookies.enum';
import ValidateCodeForForgotPasswordUseCase from '@auth/application/use-cases/validate-code-for-forgot-password.usecase';
import SendCodeForForgotPasswordUseCase from '@auth/application/use-cases/send-code-for-forgot-password.usecase';
import { FastifyReply } from 'fastify';
import { UpdatePasswordDTOFactory } from '@auth/infrastructure/helpers/tests/dtos-mocks';

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
    let expressResponse: FastifyReply;
    const email = EmailConstants.EXEMPLE;
    const dto = { email };

    beforeEach(() => {
      expressResponse = {
        redirect: vi.fn(),
        status: vi.fn(),
      } as any;

      vi.spyOn(expressResponse, 'status').mockReturnValue({
        redirect: expressResponse.redirect,
      } as any);
    });

    it('should call sendCodeForForgotPasswordUseCase.execute with email', async () => {
      await controller.sendCode(dto, expressResponse);

      expect(sendCodeForForgotPasswordUseCase.execute).toHaveBeenCalledWith(
        email,
      );
    });

    it('should redirect on success', async () => {
      await controller.sendCode(dto, expressResponse);

      expect(expressResponse.status).toHaveBeenCalledWith(HttpStatus.SEE_OTHER);
      expect(expressResponse.redirect).toHaveBeenCalledWith(
        'https://github.com/VitorMendonca62',
      );
    });

    it('should throw error if createSessionUseCase throws error', async () => {
      vi.spyOn(sendCodeForForgotPasswordUseCase, 'execute').mockRejectedValue(
        new Error('Erro no use case'),
      );

      try {
        await controller.sendCode(dto, expressResponse);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('validateCode', () => {
    let expressResponse: FastifyReply;
    const email = EmailConstants.EXEMPLE;
    const code = 'AAAAAA';
    const dto = { email, code };

    beforeEach(() => {
      expressResponse = {
        redirect: vi.fn(),
        status: vi.fn(),
      } as any;

      vi.spyOn(expressResponse, 'status').mockReturnValue({
        redirect: expressResponse.redirect,
      } as any);
    });

    it('should call validCodeForForgotPasswordUseCase.execute with email and code', async () => {
      await controller.validateCode(dto, expressResponse);

      expect(validateCodeForForgotPasswordUseCase.execute).toHaveBeenCalledWith(
        code,
        email,
      );
    });

    it('should store reset token in cookie', async () => {
      vi.spyOn(
        validateCodeForForgotPasswordUseCase,
        'execute',
      ).mockResolvedValue('token');

      await controller.validateCode(dto, expressResponse);

      expect(cookiesService.setCookie).toHaveBeenCalledWith(
        Cookies.ResetPassToken,
        'token',
        600000,
        expressResponse,
      );
    });

    it('should redirect on code and email are valid', async () => {
      vi.spyOn(
        validateCodeForForgotPasswordUseCase,
        'execute',
      ).mockResolvedValue('token');

      const result = await controller.validateCode(dto, expressResponse);

      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Seu código de recuperação de senha foi validado com sucesso.',
      });
    });

    it('should throw error if validateCodeForForgotPasswordUseCase throws error', async () => {
      vi.spyOn(
        validateCodeForForgotPasswordUseCase,
        'execute',
      ).mockRejectedValue(new Error('Erro no use case'));

      try {
        await controller.validateCode(dto, expressResponse);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('resetPassword', () => {
    let response: FastifyReply;

    const email = EmailConstants.EXEMPLE;
    const newPassword = PasswordConstants.EXEMPLE;
    const dto = { newPassword };

    beforeEach(() => {
      response = {
        status: vi.fn(),
        redirect: vi.fn(),
      } as any;

      vi.spyOn(response, 'status').mockReturnValue({
        redirect: response.redirect,
      } as any);
    });

    it('should call changePasswordUseCase.executeReset with email and new password', async () => {
      await controller.resetPassword(dto, response, email);

      expect(changePasswordUseCase.executeReset).toHaveBeenCalledWith(
        email,
        newPassword,
      );
    });

    it('should redirect on success', async () => {
      await controller.resetPassword(dto, response, email);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.SEE_OTHER);
      expect(response.redirect).toHaveBeenCalledWith(
        'https://github.com/VitorMendonca62',
      );
    });

    it('should throw error if changePasswordUseCase throws error', async () => {
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

    it('should call changePasswordUseCase.executeUpdate with userId and passwords', async () => {
      await controller.updatePassword(dto, userID);

      expect(changePasswordUseCase.executeUpdate).toHaveBeenCalledWith(
        IDConstants.EXEMPLE,
        dto.newPassword,
        dto.oldPassword,
      );
    });

    it('should return HttpOKResponse on success', async () => {
      const response = await controller.updatePassword(dto, userID);
      expect(response).toBeInstanceOf(HttpOKResponse);
      expect(response).toEqual({
        statusCode: HttpStatus.OK,
        message: 'A senha do usuário foi atualizada!',
      });
    });

    it('should throw error if changePasswordUseCase throws error', async () => {
      vi.spyOn(changePasswordUseCase, 'executeUpdate').mockRejectedValue(
        new Error('Erro no use case'),
      );

      try {
        await controller.updatePassword(dto, userID);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
        expect(error.data).toBeUndefined();
      }
    });
  });
});
