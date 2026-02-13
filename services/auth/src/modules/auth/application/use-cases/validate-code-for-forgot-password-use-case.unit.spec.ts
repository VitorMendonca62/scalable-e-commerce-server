import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import ValidateCodeForForgotPasswordUseCase from './validate-code-for-forgot-password.usecase';
import EmailCodeRepository from '@auth/domain/ports/secondary/email-code-repository.port';
import { EmailConstants } from '@auth/domain/values-objects/constants';
import { EmailCodeModelFactory } from '@auth/infrastructure/helpers/tests/email-code-factory';
import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';

describe('ValidateCodeForForgotPasswordUseCase', () => {
  let useCase: ValidateCodeForForgotPasswordUseCase;

  let emailCodeRepository: EmailCodeRepository;
  let tokenService: TokenService;

  let emailCodeModelFactory: EmailCodeModelFactory;

  beforeEach(async () => {
    emailCodeRepository = {
      save: vi.fn(),
      findOne: vi.fn(),
      deleteMany: vi.fn(),
    } as any;

    tokenService = {
      generateResetPassToken: vi.fn(),
      verifyResetPassToken: vi.fn(),
    } as any;

    useCase = new ValidateCodeForForgotPasswordUseCase(
      emailCodeRepository,
      tokenService,
    );

    emailCodeModelFactory = new EmailCodeModelFactory();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(emailCodeRepository).toBeDefined();
  });

  describe('execute', () => {
    const email = EmailConstants.EXEMPLE;
    const code = 'AAAAAA';

    beforeEach(() => {
      vi.spyOn(emailCodeRepository, 'findOne').mockResolvedValue(
        emailCodeModelFactory.likeOBject(),
      );

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-01T16:00:00.000Z'));
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    it('should return reset pass token', async () => {
      const token = 'RESET-PASS-TOKEN';
      vi.spyOn(tokenService, 'generateResetPassToken').mockReturnValue(token);

      const result = await useCase.execute(code, email);
      expect(result).toEqual({ ok: true, result: token });
    });

    it('should call emailCodeRepository.find with email and code', async () => {
      await useCase.execute(code, email);
      expect(emailCodeRepository.findOne).toHaveBeenCalledWith({ code, email });
    });

    it('should return field invalid reason and ok is false when no have document with code and email', async () => {
      vi.spyOn(emailCodeRepository, 'findOne').mockResolvedValue(undefined);

      const result = await useCase.execute(code, email);
      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.FIELD_INVALID,
        message: 'Código de recuperação inválido ou expirado. Tente novamente',
      });
    });

    it('should return field invalid when the code expired', async () => {
      vi.spyOn(emailCodeRepository, 'findOne').mockResolvedValue(
        emailCodeModelFactory.likeOBject({
          expiresIn: new Date('2024-01-01T10:10:00z'),
        }),
      );

      const result = await useCase.execute(code, email);
      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.FIELD_INVALID,
        message: 'Código de recuperação inválido ou expirado. Tente novamente',
      });
    });

    it('should call emailCodeRepository.deleteMany with correct parameters', async () => {
      await useCase.execute(code, email);

      expect(emailCodeRepository.deleteMany).toHaveBeenCalledWith(email);
    });

    it('should call tokenService.generateResetPassToken with correct parameters', async () => {
      await useCase.execute(code, email);

      expect(tokenService.generateResetPassToken).toHaveBeenCalledWith({
        email,
      });
    });

    it('should rethrow error if codeRepository.find throw error', async () => {
      vi.spyOn(emailCodeRepository, 'findOne').mockRejectedValue(
        new Error('Error finding email code row'),
      );

      try {
        await useCase.execute(code, email);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error finding email code row');
        expect(error.data).toBeUndefined();
      }
    });

    it('should rethrow error if codeRepository.deleteMany throw error', async () => {
      vi.spyOn(emailCodeRepository, 'deleteMany').mockRejectedValue(
        new Error('Error deleting code'),
      );

      try {
        await useCase.execute(code, email);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error deleting code');
        expect(error.data).toBeUndefined();
      }
    });

    it('should rethrow error if tokenService throw error', async () => {
      vi.spyOn(tokenService, 'generateResetPassToken').mockImplementation(
        () => {
          throw new Error('Error generate reset pass token');
        },
      );

      try {
        await useCase.execute(code, email);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error generate reset pass token');
        expect(error.data).toBeUndefined();
      }
    });
  });
});
