import { BrazilStates } from '@modules/user/domain/enums/brazil-ufs.enum';
import { StateConstants } from '@modules/user/domain/values-objects/address/constants';

import { applyDecorators } from '@nestjs/common';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';

export function State() {
  return applyDecorators(
    IsNotEmpty({
      message: StateConstants.ERROR_REQUIRED,
    }),
    IsString({ message: StateConstants.ERROR_STRING }),
    Length(StateConstants.LENGTH, StateConstants.LENGTH, {
      message: StateConstants.ERROR_LENGTH,
    }),
    IsEnum(BrazilStates, {
      message: StateConstants.ERROR_NOT_BRAZIL_STATE,
    }),
  );
}
