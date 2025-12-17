import EmailCodeRepository from '@auth/domain/ports/secondary/code-repository.port';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailCodeDocument, EmailCode } from '../models/code.model';

export default class MongooseEmailCodeRepository implements EmailCodeRepository {
  constructor(
    @InjectModel(EmailCode.name) private CodeModel: Model<EmailCodeDocument>,
  ) {}

  async save(email: string, code: string, expiresIn: number): Promise<void> {
    const codeModel = new this.CodeModel({ email, code, expiresIn });
    await codeModel.save();
  }
}
