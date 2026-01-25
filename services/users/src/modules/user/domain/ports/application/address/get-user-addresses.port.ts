import { ApplicationResultReasons } from '@modules/user/domain/enums/application-result-reasons';

export interface GetUserAddressesPort {
  execute: (userID: string) => Promise<ExecuteReturn>;
}

type ExecuteResultReasons = ApplicationResultReasons.NOT_FOUND;

export type ExecuteReturn =
  | {
      ok: true;
      result: {
        id: number;
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
