import { PasswordConstants } from '@modules/user/domain/constants/password-constants';
import BcryptPasswordHasher from './bcrypt-password-hasher';
import * as bcrypt from 'bcryptjs';
import { type Mock } from 'vitest';

vi.mock('bcryptjs', () => {
  return {
    hashSync: vi.fn(),
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
      (bcrypt.hashSync as Mock).mockReturnValue('PasswordHashed');
    });

    it('should call bcrypt.hashSync with the correct parameters', () => {
      service.hash(PasswordConstants.EXEMPLE);

      expect(bcrypt.hashSync).toHaveBeenCalledWith(
        PasswordConstants.EXEMPLE,
        10,
      );
      expect(bcrypt.hashSync).toHaveBeenCalledTimes(1);
    });

    it('should return the result from bcrypt.hashSync', () => {
      const result = service.hash(PasswordConstants.EXEMPLE);

      expect(typeof result).toBe('string');
      expect(result).toBe('PasswordHashed');
    });
  });
});
