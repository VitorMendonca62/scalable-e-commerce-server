export default abstract class CodeRepository {
  abstract save(email: string, code: string, expiresIn: number): Promise<void>;
}
