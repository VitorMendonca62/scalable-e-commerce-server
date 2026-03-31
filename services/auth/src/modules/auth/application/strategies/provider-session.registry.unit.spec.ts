import { ProviderSessionRegistry } from './provider-session.registry';
import { AccountsProvider } from '@auth/domain/types/accounts-provider';
import { ProviderSessionStrategy } from './provider-session.strategy';

describe('ProviderSessionRegistry', () => {
  const googleStrategy: ProviderSessionStrategy = {
    provider: AccountsProvider.GOOGLE,
    execute: vi.fn(),
  };

  const defaultStrategy: ProviderSessionStrategy = {
    provider: AccountsProvider.DEFAULT,
    execute: vi.fn(),
  };

  it('should return the matching strategy', () => {
    const registry = new ProviderSessionRegistry([
      defaultStrategy,
      googleStrategy,
    ]);

    const strategy = registry.get(AccountsProvider.GOOGLE);

    expect(strategy).toBe(googleStrategy);
  });

  it('should throw when strategy is not registered', () => {
    const registry = new ProviderSessionRegistry([defaultStrategy]);

    expect(() => registry.get(AccountsProvider.GOOGLE)).toThrowError(
      'No provider session strategy for google',
    );
  });
});
