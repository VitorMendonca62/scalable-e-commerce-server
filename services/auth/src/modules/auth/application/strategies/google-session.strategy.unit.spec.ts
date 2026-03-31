vi.mock('uuid', () => {
  return { v7: vi.fn() };
});

import { GoogleSessionStrategy } from './google-session.strategy';
import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import {
  GoogleUserFactory,
  UserFactory,
} from '@auth/infrastructure/helpers/tests/user-factory';
import { AccountsProvider } from '@auth/domain/types/accounts-provider';
import IDConstants from '@auth/domain/values-objects/id/id-constants';
import { v7 } from 'uuid';
import { type Mock } from 'vitest';

describe('GoogleSessionStrategy', () => {
  let strategy: GoogleSessionStrategy;
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = {
      findSessionUserByEmail: vi.fn(),
      createGoogleUser: vi.fn(),
      updateAccountProvider: vi.fn(),
    } as any;

    strategy = new GoogleSessionStrategy(userRepository);
    (v7 as Mock).mockReturnValue(IDConstants.EXEMPLE);
  });

  const googleLogin = GoogleUserFactory.createEntity();
  const defaultSessionUser = UserFactory.createSessionUser();
  const googleSessionUser = UserFactory.createSessionUser();

  describe('existing user', () => {
    beforeEach(() => {
      vi.spyOn(userRepository, 'findSessionUserByEmail').mockResolvedValue(
        defaultSessionUser,
      );
    });

    it('should link account provider when account provider is default', async () => {
      await strategy.execute(googleLogin);

      expect(userRepository.findSessionUserByEmail).toHaveBeenCalledWith(
        googleLogin.email.getValue(),
      );
      expect(userRepository.updateAccountProvider).toHaveBeenCalledWith(
        defaultSessionUser.userID,
        AccountsProvider.GOOGLE,
        googleLogin.id,
      );
    });

    it('should not link account provider when provider already matches', async () => {
      vi.spyOn(userRepository, 'findSessionUserByEmail').mockResolvedValue({
        ...defaultSessionUser,
        accountProvider: AccountsProvider.GOOGLE,
        accountProviderID: `google-${IDConstants.EXEMPLE}`,
      });

      await strategy.execute(googleLogin);

      expect(userRepository.updateAccountProvider).not.toHaveBeenCalled();
    });

    it('should return baseUser and no newUser', async () => {
      const result = await strategy.execute(googleLogin);

      expect(result.baseUser).toEqual(defaultSessionUser);
      expect(result.newUser).toBeUndefined();
    });
  });

  describe('new user', () => {
    beforeEach(() => {
      vi.spyOn(userRepository, 'findSessionUserByEmail').mockResolvedValue(
        null,
      );
      vi.spyOn(userRepository, 'createGoogleUser').mockResolvedValue(
        googleSessionUser,
      );
    });

    it('should create a google user with generated id', async () => {
      await strategy.execute(googleLogin);

      expect(userRepository.createGoogleUser).toHaveBeenCalledWith(
        googleLogin,
        IDConstants.EXEMPLE,
      );
      expect(userRepository.updateAccountProvider).not.toHaveBeenCalled();
    });

    it('should return baseUser and newUser', async () => {
      const result = await strategy.execute(googleLogin);

      expect(result.baseUser).toEqual(googleSessionUser);
      expect(result.newUser).toEqual(googleSessionUser);
    });
  });
});
