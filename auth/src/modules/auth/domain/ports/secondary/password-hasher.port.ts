export interface IPasswordHasher {
  hash(password: string): string;
  compare(password: string, hashed: string): boolean;
}
