import PasswordValidator from './password-validator';
import PasswordVO from './password-vo';
import { PasswordConstants } from './password-constants';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import { mockPasswordHasher } from '@auth/infrastructure/helpers/tests/password-helpers';

describe('PasswordVO', () => {
  let passwordHasher: PasswordHasher;

  beforeEach(() => {
    jest.spyOn(PasswordValidator, 'validate').mockReturnValue();
    passwordHasher = mockPasswordHasher();
  });

  describe('Constructor', () => {
    it('should store the value default if hashPassword is true', () => {
      const valueObject = new PasswordVO(
        PasswordConstants.EXEMPLE,
        true,
        false,
        passwordHasher,
      );
      expect(valueObject.getValue()).toBe(PasswordConstants.EXEMPLE);
      expect(typeof valueObject.getValue()).toBe('string');
      expect(passwordHasher.hash).not.toHaveBeenCalled();
    });

    it('should store the value hashed if hashPassword is true', () => {
      const valueObject = new PasswordVO(
        PasswordConstants.EXEMPLE,
        false,
        true,
        passwordHasher,
      );
      expect(passwordHasher.hash).toHaveBeenCalled();
      expect(valueObject.getValue()).toBe('Hash');
    });

    it('should call PasswordValidator.validate with value and if is strong password', () => {
      new PasswordVO(PasswordConstants.EXEMPLE, true, false, passwordHasher);

      expect(PasswordValidator.validate).toHaveBeenCalledWith(
        PasswordConstants.EXEMPLE,
        true,
      );

      new PasswordVO(PasswordConstants.EXEMPLE, false, false, passwordHasher);

      expect(PasswordValidator.validate).toHaveBeenCalledWith(
        PasswordConstants.EXEMPLE,
        false,
      );
    });

    it('should rethrow error if validator throw error', () => {
      jest.spyOn(PasswordValidator, 'validate').mockImplementation(() => {
        throw new Error('Error');
      });

      expect(() => {
        new PasswordVO(PasswordConstants.EXEMPLE, false, false, passwordHasher);
      }).toThrow('Error');
    });
  });

  describe('comparePassword', () => {
    it('should call passwordHasher.compare with hashed password and default password', () => {
      // hashed password
      const valueObject = new PasswordVO(
        PasswordConstants.EXEMPLE,
        true,
        true,
        passwordHasher,
      );

      valueObject.comparePassword(PasswordConstants.EXEMPLE);

      expect(passwordHasher.compare).toHaveBeenCalledWith(
        PasswordConstants.EXEMPLE,
        'Hash',
      );
    });

    it('should return passwordHasher.compare result', () => {
      (passwordHasher.compare as jest.Mock).mockReturnValue(false);
      // hashed password
      const valueObject = new PasswordVO(
        PasswordConstants.EXEMPLE,
        true,
        true,
        passwordHasher,
      );

      const result = valueObject.comparePassword(PasswordConstants.EXEMPLE);

      expect(result).toBe(false);

      (passwordHasher.compare as jest.Mock).mockReturnValue(true);
      // hashed password
      const valueObject2 = new PasswordVO(
        PasswordConstants.EXEMPLE,
        true,
        true,
        passwordHasher,
      );

      const result2 = valueObject2.comparePassword(PasswordConstants.EXEMPLE);

      expect(result2).toBe(true);
    });
  });
});
