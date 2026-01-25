vi.unmock('@auth/domain/values-objects/password/password-vo');
import PasswordVO from './password-vo';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import { type Mock } from 'vitest';
import PasswordConstants from './password-constants';
import { PasswordHashedConstants } from '../constants';
import { PasswordHasherFactory } from '@auth/infrastructure/helpers/tests/password-factory';

describe('PasswordVO', () => {
  let passwordHasher: PasswordHasher;

  beforeEach(() => {
    passwordHasher = new PasswordHasherFactory().default();
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
