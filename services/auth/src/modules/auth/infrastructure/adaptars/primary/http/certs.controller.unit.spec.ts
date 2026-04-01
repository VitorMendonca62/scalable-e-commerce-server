import GetCertsUseCase from '@auth/application/use-cases/get-certs.usecase';
import CertsController from './certs.controller';
import { HttpStatus } from '@nestjs/common';
import { NotPossible } from '@auth/domain/ports/primary/http/errors.port';
import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';

describe('CertsController', () => {
  let controller: CertsController;

  let getCertsUseCase: GetCertsUseCase;

  beforeEach(async () => {
    getCertsUseCase = {
      getAuthCert: vi.fn(),
      getResetPassCert: vi.fn(),
    } as any;

    controller = new CertsController(getCertsUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(getCertsUseCase).toBeDefined();
  });

  describe('getCerts', () => {
    let response: any;
    const authCert = {
      kid: 'AUTH_JWT_KEYID',
      alg: 'RS256',
      use: 'sig',
    } as any;

    const resetPassCert = {
      kid: 'RESET_PASS_KEYID',
      alg: 'RS256',
      use: 'sig',
    } as any;

    beforeEach(() => {
      response = {
        status: vi.fn().mockReturnThis(),
      } as any;

      vi.spyOn(getCertsUseCase, 'getAuthCert').mockResolvedValue({
        ok: true,
        result: authCert,
      });
      vi.spyOn(getCertsUseCase, 'getResetPassCert').mockResolvedValue({
        ok: true,
        result: resetPassCert,
      });
    });
    it('should call getAuthCert and getResetPassCert', async () => {
      await controller.getCerts(response);

      expect(getCertsUseCase.getAuthCert).toHaveBeenCalled();
      expect(getCertsUseCase.getResetPassCert).toHaveBeenCalled();
    });

    it('should return keys on success', async () => {
      const result = await controller.getCerts(response);

      expect(Object.keys(result)).toContain('keys');
      expect(result.keys[0]).toEqual(authCert);
      expect(result.keys[1]).toEqual(resetPassCert);
    });

    it('should return NotPossible when auth cert fails', async () => {
      vi.spyOn(getCertsUseCase, 'getAuthCert').mockResolvedValueOnce({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro inesperado',
      } as any);

      const result = await controller.getCerts(response);

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro inesperado',
      });
    });

    it('should return NotPossible when reset pass cert fails', async () => {
      vi.spyOn(getCertsUseCase, 'getResetPassCert').mockResolvedValueOnce({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro inesperado',
      } as any);

      const result = await controller.getCerts(response);

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro inesperado',
      });
    });
  });
});
