vi.unmock('@auth/domain/values-objects/password/password-vo');
import PasswordVO from './password-vo';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import { type Mock } from 'vitest';
import PasswordConstants from './password-constants';
import { PasswordHashedConstants } from '../constants';
import { PasswordHasherFactory } from '@auth/infrastructure/helpers/tests/password-factory';
import PasswordHashedVO from '../password-hashed/password-hashed-vo';

describe('PasswordVO', () => {
  let passwordHasher: PasswordHasher;

  beforeEach(() => {
    passwordHasher = new PasswordHasherFactory().default();
  });

  describe('Constructor', () => {
    it('should store the value', () => {
      const valueObject = new PasswordVO(
        PasswordConstants.EXEMPLE,
        passwordHasher,
      );
      expect(valueObject.getValue()).toBe(PasswordConstants.EXEMPLE);
    });
  });

  describe('create', () => {
    it('should call hashed function', async () => {
      await PasswordVO.createAndHash(PasswordConstants.EXEMPLE, passwordHasher);

      expect(passwordHasher.hash).toHaveBeenCalledWith(
        PasswordConstants.EXEMPLE,
      );
    });

    it('should return PasswordHashedVO with hashed password', async () => {
      const valueObject = await PasswordVO.createAndHash(
        PasswordConstants.EXEMPLE,
        passwordHasher,
      );

      expect(valueObject).toBeInstanceOf(PasswordHashedVO);
      expect(valueObject.getValue()).toBe(PasswordHashedConstants.EXEMPLE);
    });
  });

  describe('comparePassword', () => {
    it('should call passwordHasher.compare with hashed password and default password', async () => {
      const valueObject = new PasswordVO(
        PasswordConstants.EXEMPLE,
        passwordHasher,
      );

      await valueObject.comparePassword(PasswordHashedConstants.EXEMPLE);

      expect(passwordHasher.compare).toHaveBeenCalledWith(
        PasswordHashedConstants.EXEMPLE,
        PasswordConstants.EXEMPLE,
      );
    });

    it('should return passwordHasher.compare result', async () => {
      (passwordHasher.compare as Mock).mockReturnValue(false);
      const valueObject = new PasswordVO(
        PasswordConstants.EXEMPLE,
        passwordHasher,
      );

      const result = await valueObject.comparePassword(
        PasswordConstants.EXEMPLE,
      );

      expect(result).toBe(false);

      (passwordHasher.compare as Mock).mockReturnValue(true);

      const valueObject2 = new PasswordVO(
        PasswordConstants.EXEMPLE,
        passwordHasher,
      );

      const result2 = await valueObject2.comparePassword(
        PasswordConstants.EXEMPLE,
      );

      expect(result2).toBe(true);
    });
  });
});
