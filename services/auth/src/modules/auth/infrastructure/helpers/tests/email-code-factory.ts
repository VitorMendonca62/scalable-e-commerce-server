import { EmailConstants } from '@auth/domain/values-objects/constants';
import { EmailCodeModel } from '@auth/infrastructure/adaptars/secondary/database/models/email-code.model';

export class EmailCodeModelFactory {
  likeOBject(overrides: Partial<EmailCodeModel> = {}): EmailCodeModel {
    return {
      code: 'AAAAAA',
      expiresIn: new Date('2026-01-01T10:10:00z'),
      email: EmailConstants.EXEMPLE,
      ...overrides,
    };
  }
}
