export abstract class PasswordHasher {
  abstract hash(password: string): string;
  abstract compare(password: string, hashed: string): boolean;
}
