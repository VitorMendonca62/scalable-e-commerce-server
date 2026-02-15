import { PasswordConstants } from '@auth/domain/values-objects/constants';
import BcryptPasswordHasher from './bcrypt-password-hasher';
import * as bcrypt from 'bcryptjs';

vi.mock('bcryptjs', async () => {
  return {
    hash: vi.fn(),
    compare: vi.fn(),
  };
});

describe('BcryptPasswordHasher', () => {
  let service: BcryptPasswordHasher;

  beforeEach(() => {
    service = new BcryptPasswordHasher();
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    beforeEach(() => {
      vi.spyOn(bcrypt, 'hash').mockImplementation(() =>
        Promise.resolve('PasswordHashed'),
      );
    });

    it('should call bcrypt.hash with the correct parameters', async () => {
      await service.hash(PasswordConstants.EXEMPLE);

      expect(bcrypt.hash).toHaveBeenCalledWith(PasswordConstants.EXEMPLE, 10);
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    });

    it('should return the result from bcrypt.hash', async () => {
      const result = await service.hash(PasswordConstants.EXEMPLE);

      expect(typeof result).toBe('string');
      expect(result).toBe('PasswordHashed');
    });
  });

  describe('compare', () => {
    beforeEach(() => {
      vi.spyOn(bcrypt, 'compare').mockImplementation(() =>
        Promise.resolve(true),
      );
    });

    it('should call bcrypt.compare with the correct parameters', async () => {
      await service.compare(PasswordConstants.EXEMPLE, 'PasswordHashed');

      expect(bcrypt.compare).toHaveBeenCalledWith(
        PasswordConstants.EXEMPLE,
        'PasswordHashed',
      );
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    });

    it('should return true when the plain password matches the hash', async () => {
      const result = await service.compare(
        PasswordConstants.EXEMPLE,
        'PasswordHashed',
      );

      expect(typeof result).toBe('boolean');
      expect(result).toBe(true);
    });

    it('should return false when the plain password does not match the hash', async () => {
      vi.spyOn(bcrypt, 'compare').mockImplementation(() =>
        Promise.resolve(false),
      );

      const result = await service.compare(
        PasswordConstants.EXEMPLE,
        'PasswordHashed',
      );

      expect(typeof result).toBe('boolean');
      expect(result).toBe(false);
    });
  });
});
