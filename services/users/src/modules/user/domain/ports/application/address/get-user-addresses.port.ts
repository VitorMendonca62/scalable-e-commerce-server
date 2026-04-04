import { ApplicationResultReasons } from '@user/domain/enums/application-result-reasons';

export interface GetUserAddressesPort {
  execute: (userID: string) => Promise<ExecuteReturn>;
}

type ExecuteResultReasons =
  | ApplicationResultReasons.NOT_FOUND
  | ApplicationResultReasons.NOT_POSSIBLE;

export type ExecuteReturn =
  | {
      ok: true;
      result: {
        addressId: number;
        city: string;
        complement: string;
        country: string;
        neighborhood: string;
        number: string;
        postalCode: string;
        state: string;
        street: string;
      }[];
    }
  | {
      ok: false;
      message: string;
      reason: ExecuteResultReasons;
    };
