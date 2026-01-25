export default abstract class EmailCodeRepository {
  abstract exists(email: string, code: string): Promise<boolean>;
  abstract deleteMany(email: string): Promise<void>;
  abstract save(email: string, code: string): Promise<void>;
}
