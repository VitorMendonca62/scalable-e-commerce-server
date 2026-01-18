vi.unmock('@auth/domain/values-objects/password/password-vo');
import PasswordValidator from './password-validator';
import PasswordVO from './password-vo';
import { PasswordConstants } from './password-constants';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import { mockPasswordHasher } from '@auth/infrastructure/helpers/tests/password-mocks';
import { PasswordHashedConstants } from '../password-hashed/password-hashed-constants';
import { type Mock } from 'vitest';
describe('PasswordVO', () => {
  let passwordHasher: PasswordHasher;

  beforeEach(() => {
    vi.spyOn(PasswordValidator, 'validate').mockReturnValue();
    passwordHasher = mockPasswordHasher();
  });

  describe('Constructor', () => {
    it('should store the value hashed', () => {
      const valueObject = new PasswordVO(
        PasswordConstants.EXEMPLE,
        true,
        passwordHasher,
      );
      expect(passwordHasher.hash).toHaveBeenCalled();
      expect(valueObject.getValue()).toBe(PasswordHashedConstants.EXEMPLE);
    });

    it('should store the value default if canHashPassword is false', () => {
      const valueObject = new PasswordVO(
        PasswordConstants.EXEMPLE,
        false,
        passwordHasher,
      );
      expect(passwordHasher.hash).not.toHaveBeenCalled();
      expect(valueObject.getValue()).toBe(PasswordConstants.EXEMPLE);
    });

    it('should call PasswordValidator.validate with value and if is strong password', () => {
      new PasswordVO(PasswordConstants.EXEMPLE, true, passwordHasher);

      expect(PasswordValidator.validate).toHaveBeenCalledWith(
        PasswordConstants.EXEMPLE,
      );
    });

    it('should rethrow error if validator throw error', () => {
      vi.spyOn(PasswordValidator, 'validate').mockImplementation(() => {
        throw new Error('Error');
      });

      try {
        new PasswordVO(PasswordConstants.EXEMPLE, true, passwordHasher);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error');
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('comparePassword', () => {
    it('should call passwordHasher.compare with hashed password and default password', () => {
      const valueObject = new PasswordVO(
        PasswordConstants.EXEMPLE,
        true,
        passwordHasher,
      );

      valueObject.comparePassword(PasswordConstants.EXEMPLE);

      expect(passwordHasher.compare).toHaveBeenCalledWith(
        PasswordConstants.EXEMPLE,
        PasswordHashedConstants.EXEMPLE,
      );
    });

    it('should return passwordHasher.compare result', () => {
      (passwordHasher.compare as Mock).mockReturnValue(false);
      const valueObject = new PasswordVO(
        PasswordConstants.EXEMPLE,
        true,
        passwordHasher,
      );

      const result = valueObject.comparePassword(PasswordConstants.EXEMPLE);

      expect(result).toBe(false);

      (passwordHasher.compare as Mock).mockReturnValue(true);

      const valueObject2 = new PasswordVO(
        PasswordConstants.EXEMPLE,

        true,
        passwordHasher,
      );

      const result2 = valueObject2.comparePassword(PasswordConstants.EXEMPLE);

      expect(result2).toBe(true);
    });
  });
});
