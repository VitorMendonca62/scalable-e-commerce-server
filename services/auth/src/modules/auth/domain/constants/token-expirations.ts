export class TokenExpirationConstants {
  static readonly RESET_PASS_TOKEN_MS = 10 * 60 * 1000; // 10min

  static readonly RESET_PASS_TOKEN_SECONDS = 10 * 60; // 10min

  static readonly ACCESS_TOKEN_SECONDS = 60 * 60; // 1h

  static readonly REFRESH_TOKEN_SECONDS = 7 * 24 * 60 * 60; // 7D
}
