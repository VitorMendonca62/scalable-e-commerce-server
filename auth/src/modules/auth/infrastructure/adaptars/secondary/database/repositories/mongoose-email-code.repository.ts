import EmailCodeRepository from '@auth/domain/ports/secondary/code-repository.port';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailCodeDocument, EmailCodeModel } from '../models/email-code.model';

export default class MongooseEmailCodeRepository implements EmailCodeRepository {
  constructor(
    @InjectModel(EmailCodeModel.name)
    private readonly EmailCodeModel: Model<EmailCodeDocument>,
  ) {}
  async findOne(
    options: Partial<EmailCodeModel>,
  ): Promise<EmailCodeModel | undefined | null> {
    return await this.EmailCodeModel.findOne(options).exec();
  }

  async save(emailCode: EmailCodeModel): Promise<void> {
    const emailCodeModel = new this.EmailCodeModel(emailCode);
    await emailCodeModel.save();
  }

  async deleteMany(email: string): Promise<void> {
    this.EmailCodeModel.deleteMany({ email }).exec();
  }
}
