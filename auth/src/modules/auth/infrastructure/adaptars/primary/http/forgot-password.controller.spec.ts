import SendCodeForForgotPasswordUseCase from '@auth/application/use-cases/send-code-for-forgot-password.usecase';
import { HttpCreatedResponse } from '@auth/domain/ports/primary/http/sucess.port';
import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { HttpStatus } from '@nestjs/common';
import { ForgorPasswordController } from './forgot-password.controller';

describe('ForgorPasswordController', () => {
  let controller: ForgorPasswordController;

  let sendCodeForForgotPasswordUseCase: SendCodeForForgotPasswordUseCase;

  beforeEach(async () => {
    sendCodeForForgotPasswordUseCase = { execute: jest.fn() } as any;

    controller = new ForgorPasswordController(sendCodeForForgotPasswordUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(sendCodeForForgotPasswordUseCase).toBeDefined();
  });

  describe('sendCode', () => {
    const email = EmailConstants.EXEMPLE;
    const dto = { email };

    beforeEach(() => {
      jest
        .spyOn(sendCodeForForgotPasswordUseCase, 'execute')
        .mockResolvedValue(undefined);
    });

    it('should call sendCodeForForgotPasswordUseCase.execute with email', async () => {
      await controller.sendCode(dto);

      expect(sendCodeForForgotPasswordUseCase.execute).toHaveBeenCalledWith(
        email,
      );
    });

    it('should return HttpCreatedResponse on success', async () => {
      const response = await controller.sendCode(dto);

      expect(response).toBeInstanceOf(HttpCreatedResponse);
      expect(response).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Código enviado com sucesso.',
        data: undefined,
      });
    });

    it('should throw error if createSessionUseCase throws error', async () => {
      jest
        .spyOn(sendCodeForForgotPasswordUseCase, 'execute')
        .mockRejectedValue(new Error('Erro no use case'));

      await expect(controller.sendCode(dto)).rejects.toThrow(
        'Erro no use case',
      );
    });
  });
});
