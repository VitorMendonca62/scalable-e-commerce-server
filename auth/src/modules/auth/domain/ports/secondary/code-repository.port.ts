export default abstract class EmailCodeRepository {
  abstract save(email: string, code: string, expiresIn: number): Promise<void>;
}
