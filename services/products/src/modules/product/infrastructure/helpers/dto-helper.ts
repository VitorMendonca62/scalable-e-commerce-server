import { validate, ValidationError } from 'class-validator';

export class ValidationObjectFactory {
  static async validateObject(dto: object): Promise<ValidationError[]> {
    return await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
    });
  }
}
