import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';

export interface BrasilAPICEPError {
  message: string;
  type: string;
  name: string;
}

export interface BrasilAPICEP {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
}

export type SearchCEPBrasilAPI = BrasilAPICEP | BrasilAPICEPError;

export abstract class AddressPort {
  abstract searchCEP(
    cep: string,
  ): Observable<AxiosResponse<SearchCEPBrasilAPI>>;
}
