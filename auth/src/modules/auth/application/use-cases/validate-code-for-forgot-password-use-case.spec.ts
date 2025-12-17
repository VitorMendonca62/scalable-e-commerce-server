import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { mockEmailCodeLikeJSONWithoutValidCode } from '@auth/infrastructure/helpers/tests/email-code-helper';
import ValidateCodeForForgotPasswordUseCase from './validate-code-for-forgot-password.usecase';
import EmailCodeRepository from '@auth/domain/ports/secondary/code-repository.port';
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

      expect(useCase.execute(code, email)).rejects.toThrow(
        new BusinessRuleFailure(
          'Código de verificação inválido ou expirado. Tente novamente',
        ),
      );
    });

    it('should throw BusinessRuleFailure when the code expired', async () => {
      jest.spyOn(emailCodeRepository, 'findOne').mockResolvedValue(
        mockEmailCodeLikeJSONWithoutValidCode({
          expiresIn: new Date('2024-01-01T10:10:00z'),
        }),
      );

      expect(useCase.execute(code, email)).rejects.toThrow(
        new BusinessRuleFailure(
          'Código de verificação inválido ou expirado. Tente novamente',
        ),
      );
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

      expect(useCase.execute(code, email)).rejects.toThrow(
        new Error('Error finding email code row'),
      );
    });

    it('should rethrow error if codeRepository.deleteMany throw error', async () => {
      jest
        .spyOn(emailCodeRepository, 'deleteMany')
        .mockRejectedValue(new Error('Error deleting code'));

      expect(useCase.execute(code, email)).rejects.toThrow(
        new Error('Error deleting code'),
      );
    });

    it('should rethrow error if tokenService throw error', async () => {
      jest
        .spyOn(tokenService, 'generateResetPassToken')
        .mockImplementation(() => {
          throw new Error('Error finding email code row');
        });

      await expect(useCase.execute(code, email)).rejects.toThrow(
        new Error('Error finding email code row'),
      );
    });
  });
});
