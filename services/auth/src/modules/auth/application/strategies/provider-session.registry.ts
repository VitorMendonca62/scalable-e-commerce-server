import { Inject, Injectable } from '@nestjs/common';
import { AccountsProvider } from '@auth/domain/types/accounts-provider';
import { ProviderSessionStrategy } from './provider-session.strategy';

export const PROVIDER_SESSION_STRATEGIES = 'PROVIDER_SESSION_STRATEGIES';

@Injectable()
export class ProviderSessionRegistry {
  constructor(
    @Inject(PROVIDER_SESSION_STRATEGIES)
    private readonly strategies: ProviderSessionStrategy[],
  ) {}

  get(provider: AccountsProvider): ProviderSessionStrategy {
    const strategy = this.strategies.find((item) => item.provider === provider);

    if (!strategy) {
      throw new Error(`No provider session strategy for ${provider}`);
    }

    return strategy;
  }
}
