import { PaymentTypes } from '@product/domain/enums/payments-types.enum';
import { PaymentsConstants } from '@product/domain/values-objects/constants';
import { applyDecorators } from '@nestjs/common';
import { IsArray, IsNotEmpty, ArrayMinSize, IsEnum } from 'class-validator';

export function Payments() {
  return applyDecorators(
    IsNotEmpty({
      message: PaymentsConstants.ERROR_REQUIRED,
    }),
    IsArray({
      message: PaymentsConstants.ERROR_ARRAY,
    }),
    ArrayMinSize(1, {
      message: PaymentsConstants.ERROR_MIN_LENGTH,
    }),
    IsEnum(PaymentTypes, {
      each: true,
      message: PaymentsConstants.ERROR_INVALID_TYPE,
    }),
  );
}
