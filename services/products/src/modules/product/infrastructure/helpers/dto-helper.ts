import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

export class ValidationObjectFactory {
  static async validateObject(dto: object): Promise<ValidationError[]> {
    const ClassType = dto.constructor as new () => any;

    const plain = Object.assign({}, dto);
    const transformed = plainToInstance(ClassType, plain);

    const errors = await validate(transformed, {
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
    });

    Object.assign(dto, transformed);

    return errors;
  }
}
