import * as otpGenerator from 'otp-generator';
import OtpGeneratorService from './otp-generator.service';

vi.mock('otp-generator', () => ({
  generate: vi.fn(),
}));

describe('OtpGeneratorService', () => {
  let service: OtpGeneratorService;

  beforeEach(() => {
    service = new OtpGeneratorService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate an OTP with correct options', () => {
    const generateMock = vi.mocked(otpGenerator.generate);
    generateMock.mockReturnValue('A1B2C3');

    const result = service.generate();

    expect(generateMock).toHaveBeenCalledWith(6, {
      upperCaseAlphabets: true,
      specialChars: false,
      digits: true,
      lowerCaseAlphabets: false,
    });
    expect(result).toBe('A1B2C3');
  });
});
