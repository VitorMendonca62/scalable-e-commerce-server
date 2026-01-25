export abstract class TokenService {
  abstract generateSignUpToken(props: { email: string }): string;
}
