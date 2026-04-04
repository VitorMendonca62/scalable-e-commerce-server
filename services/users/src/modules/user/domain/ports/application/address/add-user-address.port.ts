import { AddressEntity } from '@user/domain/entities/address.entity';
import { ApplicationResultReasons } from '@user/domain/enums/application-result-reasons';

export interface AddUserAddressPort {
  execute: (newAddress: AddressEntity) => Promise<ExecuteReturn>;
}

type ExecuteResultReasons =
  | ApplicationResultReasons.BUSINESS_RULE_FAILURE
  | ApplicationResultReasons.NOT_POSSIBLE;

export type ExecuteReturn =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
      reason: ExecuteResultReasons;
    };
