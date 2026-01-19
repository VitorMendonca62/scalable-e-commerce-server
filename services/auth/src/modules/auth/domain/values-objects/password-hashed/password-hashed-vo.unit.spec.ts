import PasswordHashedVO from './password-hashed-vo';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import { PasswordHashedConstants } from './password-hashed-constants';
import { PasswordConstants } from '../password/password-constants';
import { type Mock } from 'vitest';
import { PasswordHasherFactory } from '@auth/infrastructure/helpers/tests/password-factory';
vi.unmock('@auth/domain/values-objects/password-hashed/password-hashed-vo');

describe('PasswordHashedVO', () => {
  let passwordHasher: PasswordHasher;

  beforeEach(() => {
    passwordHasher = new PasswordHasherFactory().default();
  });

  describe('Constructor', () => {
    it('should store the value', () => {
      const valueObject = new PasswordHashedVO(
        PasswordHashedConstants.EXEMPLE,
        passwordHasher,
      );
      expect(valueObject.getValue()).toBe(PasswordHashedConstants.EXEMPLE);
    });

    describe('comparePassword', () => {
      it('should call passwordHasher.compare with hashed password and default password', () => {
        const valueObject = new PasswordHashedVO(
          PasswordHashedConstants.EXEMPLE,
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
        const valueObject = new PasswordHashedVO(
          PasswordHashedConstants.EXEMPLE,
          passwordHasher,
        );

        const result = valueObject.comparePassword(PasswordConstants.EXEMPLE);

        expect(result).toBe(false);

        (passwordHasher.compare as Mock).mockReturnValue(true);
        const valueObject2 = new PasswordHashedVO(
          PasswordHashedConstants.EXEMPLE,
          passwordHasher,
        );

        const result2 = valueObject2.comparePassword(PasswordConstants.EXEMPLE);

        expect(result2).toBe(true);
      });
    });
  });
});
