import { PasswordConstants } from '@user/domain/constants/password-constants';
import BcryptPasswordHasher from './bcrypt-password-hasher';
import * as bcrypt from 'bcryptjs';
import { type Mock } from 'vitest';

vi.mock('bcryptjs', () => {
  return {
    hash: vi.fn(),
  };
});

describe('BcryptPasswordHasher', () => {
  let service: BcryptPasswordHasher;

  beforeEach(() => {
    service = new BcryptPasswordHasher();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    beforeEach(() => {
      (bcrypt.hash as Mock).mockResolvedValue('PasswordHashed');
    });

    it('should call bcrypt.hash with the correct parameters', () => {
      service.hash(PasswordConstants.EXEMPLE);

      expect(bcrypt.hash).toHaveBeenCalledWith(PasswordConstants.EXEMPLE, 10);
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    });

    it('should return the result from bcrypt.hash', async () => {
      const result = await service.hash(PasswordConstants.EXEMPLE);

      expect(typeof result).toBe('string');
      expect(result).toBe('PasswordHashed');
    });
  });
});
