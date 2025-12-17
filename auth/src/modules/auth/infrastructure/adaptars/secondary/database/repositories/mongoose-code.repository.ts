import CodeRepository from '@auth/domain/ports/secondary/code-repository.port';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CodeDocument, CodeModel } from '../models/code.model';

export default class MongooseCodeRepository implements CodeRepository {
  constructor(
    @InjectModel(CodeModel.name) private CodeModel: Model<CodeDocument>,
  ) {}

  async save(email: string, code: string, expiresIn: number): Promise<void> {
    const codeModel = new this.CodeModel({ email, code, expiresIn });
    await codeModel.save();
  }
}
