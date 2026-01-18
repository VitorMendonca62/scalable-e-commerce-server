import { PasswordConstants } from '@auth/domain/values-objects/password/password-constants';
import BcryptPasswordHasher from './bcrypt-password-hasher';
import * as bcrypt from 'bcryptjs';
import { type Mock } from 'vitest';

vi.mock('bcryptjs', () => {
  return {
    hashSync: vi.fn(),
    compareSync: vi.fn(),
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

  describe('compare', () => {
    beforeEach(() => {
      (bcrypt.compareSync as Mock).mockReturnValue(true);
    });

    it('should call bcrypt.compareSync with the correct parameters', () => {
      service.compare(PasswordConstants.EXEMPLE, 'PasswordHashed');

      expect(bcrypt.compareSync).toHaveBeenCalledWith(
        PasswordConstants.EXEMPLE,
        'PasswordHashed',
      );
      expect(bcrypt.compareSync).toHaveBeenCalledTimes(1);
    });

    it('should return true when the plain password matches the hash', () => {
      const result = service.compare(
        PasswordConstants.EXEMPLE,
        'PasswordHashed',
      );

      expect(typeof result).toBe('boolean');
      expect(result).toBe(true);
    });

    it('should return false when the plain password does not match the hash', () => {
      vi.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

      const result = service.compare(
        PasswordConstants.EXEMPLE,
        'PasswordHashed',
      );

      expect(typeof result).toBe('boolean');
      expect(result).toBe(false);
    });
  });
});
