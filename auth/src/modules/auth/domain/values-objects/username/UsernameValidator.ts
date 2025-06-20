import { isNotEmpty, isString } from 'class-validator';
import { UsernameConstants } from './UsernameConstants';

export class UsernameValidator {
  static isValid(value: string, isOptionalClient: boolean): boolean {
    const IsRequiredOrNo = isOptionalClient ? true : isNotEmpty(value);
    const minLength = value.length >= UsernameConstants.MIN_LENGTH;
    const noSpaces = !/\s/.test(value);

    return isString(value) && IsRequiredOrNo && minLength && noSpaces;
  }
}
