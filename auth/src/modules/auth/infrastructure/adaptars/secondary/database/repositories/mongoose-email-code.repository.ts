import EmailCodeRepository from '@auth/domain/ports/secondary/code-repository.port';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailCodeDocument, EmailCodeModel } from '../models/email-code.model';

export default class MongooseEmailCodeRepository implements EmailCodeRepository {
  constructor(
    @InjectModel(EmailCodeModel.name)
    private EmailCodeModel: Model<EmailCodeDocument>,
  ) {}

  async save(
    email: string,
    code: string,
    codeExpiresIn: number,
  ): Promise<void> {
    const emailCodeModel = new this.EmailCodeModel({
      email,
      code,
      codeExpiresIn,
      canUpdatePassword: false,
      canUpdatePasswordExpiresIn: undefined,
    });
    await emailCodeModel.save();
  }
}
