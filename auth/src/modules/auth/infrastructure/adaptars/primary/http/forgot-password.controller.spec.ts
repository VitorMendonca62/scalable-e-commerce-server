import SendCodeForForgotPasswordUseCase from '@auth/application/use-cases/send-code-for-forgot-password.usecase';
import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { HttpStatus } from '@nestjs/common';
import { ForgotPasswordController } from './forgot-password.controller';
import { Response } from 'express';
import ValidateCodeForForgotPasswordUseCase from '@auth/application/use-cases/validate-code-for-forgot-password.usecase';

describe('ForgotPasswordController', () => {
  let controller: ForgotPasswordController;

  let sendCodeForForgotPasswordUseCase: SendCodeForForgotPasswordUseCase;
  let validateCodeForForgotPasswordUseCase: ValidateCodeForForgotPasswordUseCase;

  beforeEach(async () => {
    sendCodeForForgotPasswordUseCase = { execute: jest.fn() } as any;
    validateCodeForForgotPasswordUseCase = { execute: jest.fn() } as any;

    controller = new ForgotPasswordController(
      sendCodeForForgotPasswordUseCase,
      validateCodeForForgotPasswordUseCase,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(sendCodeForForgotPasswordUseCase).toBeDefined();
    expect(validateCodeForForgotPasswordUseCase).toBeDefined();
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
});
