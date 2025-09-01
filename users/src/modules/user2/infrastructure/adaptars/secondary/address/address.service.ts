import {
  AddressPort,
  SearchCEPBrasilAPI,
} from '@modules/user2/domain/ports/secondary/address-service.port';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Agent } from 'https';

@Injectable()
export class AddressService implements AddressPort {
  private readonly baseUrl: string = 'https://brasilapi.com.br/api/cep/v1';

  constructor(private readonly httpService: HttpService) {}

  searchCEP(cep: string): Observable<AxiosResponse<SearchCEPBrasilAPI>> {
    const agent = new Agent({
      rejectUnauthorized: false,
    });
    return this.httpService.get<SearchCEPBrasilAPI>(`${this.baseUrl}/${cep}`, {
      httpAgent: agent,
    });
  }
}
