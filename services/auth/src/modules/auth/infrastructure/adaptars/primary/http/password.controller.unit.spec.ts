import {
  EmailConstants,
  PasswordConstants,
} from '@auth/domain/values-objects/constants';
import { HttpStatus } from '@nestjs/common';
import { PasswordController } from './password.controller';

import IDConstants from '@auth/domain/values-objects/id/id-constants';
import { HttpOKResponse } from '@auth/domain/ports/primary/http/sucess.port';
import { ChangePasswordUseCase } from '@auth/application/use-cases/change-password.usecase';
import { Cookies } from '@auth/domain/enums/cookies.enum';
import { FastifyReply } from 'fastify';
import { UpdatePasswordDTOFactory } from '@auth/infrastructure/helpers/tests/dtos-factory';
import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';
import { NotPossible } from '@auth/domain/ports/primary/http/errors.port';
import ForgotPasswordUseCase from '@auth/application/use-cases/forgot-password.usecase';
import UseCaseResultToHttpMapper from '@auth/infrastructure/mappers/use-case-result-to-http.mapper';

describe('PasswordController', () => {
  let controller: PasswordController;

  let forgotPasswordUseCase: ForgotPasswordUseCase;
  let changePasswordUseCase: ChangePasswordUseCase;
  let useCaseResultToHttpMapper: UseCaseResultToHttpMapper;

  beforeEach(async () => {
    forgotPasswordUseCase = {
      sendCode: vi.fn(),
      validateCode: vi.fn(),
    } as any;

    changePasswordUseCase = {
      executeReset: vi.fn(),
      executeUpdate: vi.fn(),
    } as any;

    useCaseResultToHttpMapper = new UseCaseResultToHttpMapper();

    controller = new PasswordController(
      useCaseResultToHttpMapper,
      forgotPasswordUseCase,
      changePasswordUseCase,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(forgotPasswordUseCase).toBeDefined();
    expect(changePasswordUseCase).toBeDefined();
    expect(useCaseResultToHttpMapper).toBeDefined();
  });

  describe('sendCode', () => {
    const email = EmailConstants.EXEMPLE;
    const dto = { email };
    let response: FastifyReply;

    beforeEach(() => {
      response = {
        status: vi.fn().mockReturnThis(),
      } as any;
    });

    it('should call forgotPasswordUseCase.validateCode with email', async () => {
      vi.spyOn(forgotPasswordUseCase, 'sendCode').mockResolvedValue({
        ok: true,
      });

      await controller.sendCode(dto, response);

      expect(forgotPasswordUseCase.sendCode).toHaveBeenCalledWith(email);
    });

    it('should return ok response when use case succeeds', async () => {
      const useCaseResult = {
        ok: true as const,
      };

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(
          new HttpOKResponse(
            'Código de recuperação enviado com sucesso. Verifique seu email.',
          ),
        );

      vi.spyOn(forgotPasswordUseCase, 'sendCode').mockResolvedValue(
        useCaseResult,
      );

      const result = await controller.sendCode(dto, response);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpOKResponse(
          'Código de recuperação enviado com sucesso. Verifique seu email.',
        ),
        response,
      );
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message:
          'Código de recuperação enviado com sucesso. Verifique seu email.',
        data: undefined,
      });
    });

    it('should return NotPossible or other when use case fails', async () => {
      const useCaseResult = {
        ok: false as const,
        message: 'Erro inesperado',
        reason: ApplicationResultReasons.NOT_POSSIBLE as const,
      };

      vi.spyOn(forgotPasswordUseCase, 'sendCode').mockResolvedValue(
        useCaseResult,
      );

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(new NotPossible('Erro inesperado'));

      const result = await controller.sendCode(dto, response);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpOKResponse(
          'Código de recuperação enviado com sucesso. Verifique seu email.',
        ),
        response,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro inesperado',
        data: undefined,
      });
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

      vi.spyOn(forgotPasswordUseCase, 'validateCode').mockResolvedValue({
        ok: true,
        result: 'token',
      });
    });

    it('should call validCodeForForgotPasswordUseCase.validateCode with email and code', async () => {
      await controller.validateCode(dto, response);

      expect(forgotPasswordUseCase.validateCode).toHaveBeenCalledWith(
        code,
        email,
      );
    });

    it('should return ok response when use case succeeds', async () => {
      const useCaseResult = {
        ok: true as const,
        result: 'token',
      };

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(
          new HttpOKResponse(
            'Seu código de recuperação de senha foi validado com sucesso.',
            { [Cookies.ResetPassToken]: 'token' },
          ),
        );

      vi.spyOn(forgotPasswordUseCase, 'validateCode').mockResolvedValue(
        useCaseResult,
      );

      const result = await controller.validateCode(dto, response);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpOKResponse(
          'Seu código de recuperação de senha foi validado com sucesso.',
          { [Cookies.ResetPassToken]: 'token' },
        ),
        response,
      );
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Seu código de recuperação de senha foi validado com sucesso.',
        data: { [Cookies.ResetPassToken]: 'token' },
      });
    });

    it('should return NotPossible or other when use case fails', async () => {
      const useCaseResult = {
        ok: false as const,
        message: 'Erro inesperado',
        reason: ApplicationResultReasons.NOT_POSSIBLE as const,
      };

      vi.spyOn(forgotPasswordUseCase, 'validateCode').mockResolvedValue(
        useCaseResult,
      );

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(new NotPossible('Erro inesperado'));

      const result = await controller.validateCode(dto, response);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpOKResponse(
          'Seu código de recuperação de senha foi validado com sucesso.',
          { [Cookies.ResetPassToken]: null },
        ),
        response,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro inesperado',
        data: undefined,
      });
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

    it('should return ok response when use case succeeds', async () => {
      const useCaseResult = {
        ok: true as const,
      };

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(new HttpOKResponse('Senha atualizada com sucesso'));

      vi.spyOn(changePasswordUseCase, 'executeReset').mockResolvedValue(
        useCaseResult,
      );

      const result = await controller.resetPassword(dto, response, email);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpOKResponse('Senha atualizada com sucesso'),
        response,
      );
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Senha atualizada com sucesso',
        data: undefined,
      });
    });

    it('should return NotPossible or other when use case fails', async () => {
      const useCaseResult = {
        ok: false as const,
        message: 'Erro inesperado',
        reason: ApplicationResultReasons.NOT_POSSIBLE as const,
      };

      vi.spyOn(changePasswordUseCase, 'executeReset').mockResolvedValue(
        useCaseResult,
      );

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(new NotPossible('Erro inesperado'));

      const result = await controller.resetPassword(dto, response, email);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpOKResponse('Senha atualizada com sucesso'),
        response,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro inesperado',
        data: undefined,
      });
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

    it('should return ok response when use case succeeds', async () => {
      const useCaseResult = {
        ok: true as const,
      };

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(
          new HttpOKResponse('A senha do usuário foi atualizada!'),
        );

      vi.spyOn(changePasswordUseCase, 'executeUpdate').mockResolvedValue(
        useCaseResult,
      );

      const result = await controller.updatePassword(dto, userID, response);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpOKResponse('A senha do usuário foi atualizada!'),
        response,
      );
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'A senha do usuário foi atualizada!',
        data: undefined,
      });
    });

    it('should return NotPossible or other when use case fails', async () => {
      const useCaseResult = {
        ok: false as const,
        message: 'Erro inesperado',
        reason: ApplicationResultReasons.NOT_POSSIBLE as const,
      };

      vi.spyOn(changePasswordUseCase, 'executeUpdate').mockResolvedValue(
        useCaseResult,
      );

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(new NotPossible('Erro inesperado'));

      const result = await controller.updatePassword(dto, userID, response);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpOKResponse('A senha do usuário foi atualizada!'),
        response,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro inesperado',
        data: undefined,
      });
    });
  });
});
