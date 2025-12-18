import PasswordValidator from './password-validator';
import PasswordVO from './password-vo';
import { PasswordConstants } from './password-constants';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import { mockPasswordHasher } from '@auth/infrastructure/helpers/tests/password-helpers';
import { PasswordHashedConstants } from '../password-hashed/password-hashed-constants';

describe('PasswordVO', () => {
  let passwordHasher: PasswordHasher;

  beforeEach(() => {
    jest.spyOn(PasswordValidator, 'validate').mockReturnValue();
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
      jest.spyOn(PasswordValidator, 'validate').mockImplementation(() => {
        throw new Error('Error');
      });

      expect(() => {
        new PasswordVO(PasswordConstants.EXEMPLE, true, passwordHasher);
      }).toThrow('Error');
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
      (passwordHasher.compare as jest.Mock).mockReturnValue(false);
      const valueObject = new PasswordVO(
        PasswordConstants.EXEMPLE,
        true,
        passwordHasher,
      );

      const result = valueObject.comparePassword(PasswordConstants.EXEMPLE);

      expect(result).toBe(false);

      (passwordHasher.compare as jest.Mock).mockReturnValue(true);

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
