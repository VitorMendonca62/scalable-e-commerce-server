import {
  BrasilAPICEP,
  BrasilAPICEPError,
  SearchCEPBrasilAPI,
} from '@modules/user/domain/ports/secondary/address-service.port';
import {
  CityConstants,
  NeighborhoodConstants,
  PostalCodeConstants,
  StateConstants,
  StreetConstants,
} from '@modules/user/domain/values-objects/address/constants';
import { HttpStatus } from '@nestjs/common';
import { AxiosError, AxiosResponse } from 'axios';
import { Observable, of } from 'rxjs';

export class AddressServiceFactory {
  static getSearchApiResponse(
    dataOverrides: Partial<Record<keyof BrasilAPICEP, any>> = {},
    overrides: Partial<Record<keyof AxiosResponse, any>> = {},
  ): Observable<AxiosResponse<SearchCEPBrasilAPI>> {
    return of({
      status: HttpStatus.OK,
      statusText: 'OK',
      headers: {},
      config: {} as any,
      ...overrides,
      data: {
        cep: PostalCodeConstants.EXEMPLE,
        state: StateConstants.EXEMPLE,
        city: CityConstants.EXEMPLE,
        neighborhood: NeighborhoodConstants.EXEMPLE,
        street: StreetConstants.EXEMPLE,
        service: 'string',
        ...dataOverrides,
      },
    });
  }

  static getSearchApiErrorResponse(
    statusText: string = 'BAD_REQUEST',
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ): AxiosError<BrasilAPICEPError> {
    return new AxiosError(statusText, statusCode.toString(), {} as any, null, {
      data: { message: 'string', name: 'string', type: 'string' },
      status: statusCode,
      statusText: statusText,
      headers: {},
      config: {} as any,
    });
  }
}
