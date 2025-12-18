import SendCodeForForgotPasswordUseCase from '@auth/application/use-cases/send-code-for-forgot-password.usecase';
import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { HttpStatus } from '@nestjs/common';
import { ForgotPasswordController } from './forgot-password.controller';
import { Request, Response } from 'express';
import ValidateCodeForForgotPasswordUseCase from '@auth/application/use-cases/validate-code-for-forgot-password.usecase';
import { PasswordConstants } from '@auth/domain/values-objects/password/password-constants';
import { ResetPasswordUseCase } from '@auth/application/use-cases/reset-password.usecase';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';
import { mockUpdatePasswordLikeInstance } from '@auth/infrastructure/helpers/tests/dtos-helper';
import { HttpAcceptedResponse } from '@auth/domain/ports/primary/http/sucess.port';
import { UpdatePasswordUseCase } from '@auth/application/use-cases/update-password-usecase';

describe('ForgotPasswordController', () => {
  let controller: ForgotPasswordController;

  let sendCodeForForgotPasswordUseCase: SendCodeForForgotPasswordUseCase;
  let validateCodeForForgotPasswordUseCase: ValidateCodeForForgotPasswordUseCase;
  let resetPasswordUseCase: ResetPasswordUseCase;
  let updatePasswordUseCase: UpdatePasswordUseCase;

  beforeEach(async () => {
    sendCodeForForgotPasswordUseCase = { execute: jest.fn() } as any;
    validateCodeForForgotPasswordUseCase = { execute: jest.fn() } as any;
    resetPasswordUseCase = { execute: jest.fn() } as any;
    updatePasswordUseCase = { execute: jest.fn() } as any;

    controller = new ForgotPasswordController(
      sendCodeForForgotPasswordUseCase,
      validateCodeForForgotPasswordUseCase,
      resetPasswordUseCase,
      updatePasswordUseCase,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(sendCodeForForgotPasswordUseCase).toBeDefined();
    expect(validateCodeForForgotPasswordUseCase).toBeDefined();
    expect(resetPasswordUseCase).toBeDefined();
    expect(updatePasswordUseCase).toBeDefined();
  });

  describe('sendCode', () => {
    let expressResponse: Response;
    const email = EmailConstants.EXEMPLE;
    const dto = { email };

    beforeEach(() => {
      expressResponse = {
        redirect: jest.fn(),
      } as any;

      jest.spyOn(expressResponse, 'redirect').mockReturnValue(undefined);
    });

    it('should call sendCodeForForgotPasswordUseCase.execute with email', async () => {
      await controller.sendCode(dto, expressResponse);

      expect(sendCodeForForgotPasswordUseCase.execute).toHaveBeenCalledWith(
        email,
      );
    });

    it('should redirect on success', async () => {
      await controller.sendCode(dto, expressResponse);

      expect(expressResponse.redirect).toHaveBeenCalledWith(
        HttpStatus.SEE_OTHER,
        '/auth/confirm-code',
      );
    });

    it('should throw error if createSessionUseCase throws error', async () => {
      jest
        .spyOn(sendCodeForForgotPasswordUseCase, 'execute')
        .mockRejectedValue(new Error('Erro no use case'));

      await expect(controller.sendCode(dto, expressResponse)).rejects.toThrow(
        'Erro no use case',
      );
    });
  });

  describe('validateCode', () => {
    let expressResponse: Response;
    const email = EmailConstants.EXEMPLE;
    const code = 'AAAAAA';
    const dto = { email, code };

    beforeEach(() => {
      expressResponse = {
        redirect: jest.fn(),
        cookie: jest.fn(),
      } as any;

      jest.spyOn(expressResponse, 'redirect').mockReturnValue(undefined);
    });

    it('should call validCodeForForgotPasswordUseCase.execute with email and code', async () => {
      await controller.validateCode(dto, expressResponse);

      expect(validateCodeForForgotPasswordUseCase.execute).toHaveBeenCalledWith(
        code,
        email,
      );
    });

    it('should store reset token in cookie', async () => {
      jest
        .spyOn(validateCodeForForgotPasswordUseCase, 'execute')
        .mockResolvedValue('token');

      await controller.validateCode(dto, expressResponse);

      expect(expressResponse.cookie).toHaveBeenCalledWith(
        'reset_token',
        'token',
        {
          httpOnly: true,
          maxAge: 600000,
          path: '/',
        },
      );
    });

    it('should redirect on code and email are valid', async () => {
      jest
        .spyOn(validateCodeForForgotPasswordUseCase, 'execute')
        .mockResolvedValue('token');

      await controller.validateCode(dto, expressResponse);

      expect(expressResponse.redirect).toHaveBeenCalledWith(
        HttpStatus.SEE_OTHER,
        '/auth/restore-password',
      );
    });

    it('should throw error if validateCodeForForgotPasswordUseCase throws error', async () => {
      jest
        .spyOn(validateCodeForForgotPasswordUseCase, 'execute')
        .mockRejectedValue(new Error('Erro no use case'));

      await expect(
        controller.validateCode(dto, expressResponse),
      ).rejects.toThrow('Erro no use case');
    });
  });

  describe('resetPassword', () => {
    let response: Response;
    let request: Request;

    const email = EmailConstants.EXEMPLE;
    const newPassword = PasswordConstants.EXEMPLE;
    const dto = { newPassword };

    beforeEach(() => {
      response = {
        redirect: jest.fn(),
      } as any;

      request = {
        user: {
          email: EmailConstants.EXEMPLE,
        },
      } as any;

      jest.spyOn(response, 'redirect').mockReturnValue(undefined);
    });

    it('should call resetPasswordUseCase.execute with email and new password', async () => {
      await controller.resetPassword(dto, request, response);

      expect(resetPasswordUseCase.execute).toHaveBeenCalledWith(
        email,
        newPassword,
      );
    });

    it('should redirect on success', async () => {
      await controller.resetPassword(dto, request, response);

      expect(response.redirect).toHaveBeenCalledWith(
        HttpStatus.SEE_OTHER,
        '/auth/login',
      );
    });

    it('should throw error if resetPasswordUseCase throws error', async () => {
      jest
        .spyOn(resetPasswordUseCase, 'execute')
        .mockRejectedValue(new Error('Erro no use case'));

      await expect(
        controller.resetPassword(dto, request, response),
      ).rejects.toThrow('Erro no use case');
    });
  });

  describe('updatePassword', () => {
    let request: Request;
    const dto = mockUpdatePasswordLikeInstance();

    beforeEach(() => {
      request = {
        user: {
          userID: IDConstants.EXEMPLE,
        },
      } as any;
    });

    it('should call updatePasswordUseCase.execute with userId and passwords', async () => {
      await controller.updatePassword(dto, request);

      expect(updatePasswordUseCase.execute).toHaveBeenCalledWith(
        IDConstants.EXEMPLE,
        dto.newPassword,
        dto.oldPassword,
      );
    });

    it('should return HttpOKResponse on success', async () => {
      const response = await controller.updatePassword(dto, request);
      expect(response).toBeInstanceOf(HttpAcceptedResponse);
      expect(response).toEqual({
        statusCode: HttpStatus.ACCEPTED,
        message: 'A senha do usuário foi atualizada!',
      });
    });

    it('should throw error if updatePasswordUseCase throws error', async () => {
      jest
        .spyOn(updatePasswordUseCase, 'execute')
        .mockRejectedValue(new Error('Erro no use case'));

      await expect(controller.updatePassword(dto, request)).rejects.toThrow(
        'Erro no use case',
      );
    });
  });
});
