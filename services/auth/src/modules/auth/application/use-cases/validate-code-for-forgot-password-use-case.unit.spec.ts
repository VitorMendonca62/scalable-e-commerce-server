import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { mockEmailCodeLikeJSONWithoutValidCode } from '@auth/infrastructure/helpers/tests/email-code-mocks';
import ValidateCodeForForgotPasswordUseCase from './validate-code-for-forgot-password.usecase';
import EmailCodeRepository from '@auth/domain/ports/secondary/email-code-repository.port';
import { BusinessRuleFailure } from '@auth/domain/ports/primary/http/errors.port';
import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';

describe('ValidateCodeForForgotPasswordUseCase', () => {
  let useCase: ValidateCodeForForgotPasswordUseCase;

  let emailCodeRepository: EmailCodeRepository;
  let tokenService: TokenService;

  beforeEach(async () => {
    emailCodeRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      deleteMany: jest.fn(),
    } as any;

    tokenService = {
      generateResetPassToken: jest.fn(),
      verifyResetPassToken: jest.fn(),
    } as any;

    useCase = new ValidateCodeForForgotPasswordUseCase(
      emailCodeRepository,
      tokenService,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(emailCodeRepository).toBeDefined();
  });

  describe('execute', () => {
    const email = EmailConstants.EXEMPLE;
    const code = 'AAAAAA';

    beforeEach(() => {
      jest
        .spyOn(emailCodeRepository, 'findOne')
        .mockResolvedValue(mockEmailCodeLikeJSONWithoutValidCode());

      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-01T16:00:00.000Z'));
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return reset pass token', async () => {
      const token = 'RESET-PASS-TOKEN';
      jest.spyOn(tokenService, 'generateResetPassToken').mockReturnValue(token);

      const response = await useCase.execute(code, email);
      expect(response).toBe(token);
    });

    it('should call emailCodeRepository.find with email and code', async () => {
      await useCase.execute(code, email);
      expect(emailCodeRepository.findOne).toHaveBeenCalledWith({ code, email });
    });

    it('should throw BusinessRuleFailure when no have document with code and email', async () => {
      jest.spyOn(emailCodeRepository, 'findOne').mockResolvedValue(undefined);

      try {
        await useCase.execute(code, email);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BusinessRuleFailure);
        expect(error.message).toBe(
          'Código de recuperação inválido ou expirado. Tente novamente',
        );
        expect(error.data).toBeUndefined();
      }
    });

    it('should throw BusinessRuleFailure when the code expired', async () => {
      jest.spyOn(emailCodeRepository, 'findOne').mockResolvedValue(
        mockEmailCodeLikeJSONWithoutValidCode({
          expiresIn: new Date('2024-01-01T10:10:00z'),
        }),
      );

      try {
        await useCase.execute(code, email);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BusinessRuleFailure);
        expect(error.message).toBe(
          'Código de recuperação inválido ou expirado. Tente novamente',
        );
        expect(error.data).toBeUndefined();
      }
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
      jest
        .spyOn(emailCodeRepository, 'findOne')
        .mockRejectedValue(new Error('Error finding email code row'));

      try {
        await useCase.execute(code, email);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error finding email code row');
        expect(error.data).toBeUndefined();
      }
    });

    it('should rethrow error if codeRepository.deleteMany throw error', async () => {
      jest
        .spyOn(emailCodeRepository, 'deleteMany')
        .mockRejectedValue(new Error('Error deleting code'));

      try {
        await useCase.execute(code, email);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error deleting code');
        expect(error.data).toBeUndefined();
      }
    });

    it('should rethrow error if tokenService throw error', async () => {
      jest
        .spyOn(tokenService, 'generateResetPassToken')
        .mockImplementation(() => {
          throw new Error('Error generate reset pass token');
        });

      try {
        await useCase.execute(code, email);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error generate reset pass token');
        expect(error.data).toBeUndefined();
      }
    });
  });
});
