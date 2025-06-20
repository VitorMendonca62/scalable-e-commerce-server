import { isNotEmpty, isString } from 'class-validator';
import { NameConstants } from './NameConstants';

export class NameValidator {
  static isValid(value: string, isOptionalClient: boolean): boolean {
    const IsRequiredOrNo = isOptionalClient ? true : isNotEmpty(value);
    const minLength = value.length >= NameConstants.MIN_LENGTH;

    return isString(value) && IsRequiredOrNo && minLength;
  }
}
