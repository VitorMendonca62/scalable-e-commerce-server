export class TokenExpirationConstants {
  static readonly REFRESH_TOKEN_MS = 7 * 24 * 60 * 60 * 1000; // 7D
  static readonly ACCESS_TOKEN_MS = 60 * 60 * 1000; // 1H
  static readonly RESET_PASS_TOKEN_MS = 10 * 60 * 1000; // 10min

  static readonly REFRESH_TOKEN_SECONDS = 7 * 24 * 60 * 60; // 7D
}
