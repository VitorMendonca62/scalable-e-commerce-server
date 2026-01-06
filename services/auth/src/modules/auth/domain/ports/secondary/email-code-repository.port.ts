import { EmailCodeModel } from '@auth/infrastructure/adaptars/secondary/database/models/email-code.model';

export default abstract class EmailCodeRepository {
  abstract findOne(
    options: Partial<EmailCodeModel>,
  ): Promise<EmailCodeModel | undefined>;
  abstract deleteMany(email: string): Promise<void>;
  abstract save(emailCode: EmailCodeModel): Promise<void>;
}
