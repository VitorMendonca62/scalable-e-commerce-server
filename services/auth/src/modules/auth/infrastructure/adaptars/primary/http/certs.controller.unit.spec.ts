import GetCertsUseCase from '@auth/application/use-cases/get-certs.usecase';
import CertsController from './certs.controller';

describe('CertsController', () => {
  let controller: CertsController;

  let getCertsUseCase: GetCertsUseCase;

  beforeEach(async () => {
    getCertsUseCase = {
      getAuthCert: jest.fn(),
      getResetPassCert: jest.fn(),
    } as any;

    controller = new CertsController(getCertsUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(getCertsUseCase).toBeDefined();
  });

  describe('getCerts', () => {
    const authCert = {
      kid: 'AUTH_JWT_KEYID',
      alg: 'RS256',
      use: 'sig',
    };

    const resetPassCert = {
      kid: 'RESET_PASS_KEYID',
      alg: 'RS256',
      use: 'sig',
    };

    beforeEach(() => {
      jest.spyOn(getCertsUseCase, 'getAuthCert').mockResolvedValue(authCert);
      jest
        .spyOn(getCertsUseCase, 'getResetPassCert')
        .mockResolvedValue(resetPassCert);
    });
    it('should call getAuthCert and getResetPassCert', async () => {
      await controller.getCerts();

      expect(getCertsUseCase.getAuthCert).toHaveBeenCalled();
      expect(getCertsUseCase.getResetPassCert).toHaveBeenCalled();
    });

    it('should return keys on success', async () => {
      const result = await controller.getCerts();

      expect(Object.keys(result)).toContain('keys');
      expect(result.keys[0]).toEqual(authCert);
      expect(result.keys[1]).toEqual(resetPassCert);
    });

    it('should throw error if getCertsUseCase throws error', async () => {
      jest
        .spyOn(getCertsUseCase, 'getAuthCert')
        .mockRejectedValueOnce(new Error('Erro no use case'));

      try {
        await controller.getCerts();
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
        expect(error.data).toBeUndefined();
      }

      jest
        .spyOn(getCertsUseCase, 'getResetPassCert')
        .mockRejectedValue(new Error('Erro no use case'));

      try {
        await controller.getCerts();
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
        expect(error.data).toBeUndefined();
      }
    });
  });
});
