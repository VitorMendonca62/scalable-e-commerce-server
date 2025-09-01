import { Address } from '@user/domain/entities/address.entity';
import { UserRepository } from '@modules/user2/domain/ports/secondary/user-repository.port';
import { HttpStatus, Injectable } from '@nestjs/common';
import {
  FieldInvalid,
  NotFoundItem,
  ExternalServiceError,
} from '@modules/user2/domain/ports/primary/http/error.port';
import { AddressService } from '@modules/user2/infrastructure/adaptars/secondary/address/address.service';
import { firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import {
  BrasilAPICEP,
  SearchCEPBrasilAPI,
} from '@modules/user2/domain/ports/secondary/address-service.port';
import { AddressRepositoy } from '@modules/user2/domain/ports/secondary/address-repository.port';
import { AddressMapper } from '@modules/user2/infrastructure/mappers/address.mapper';

@Injectable()
export class AddUserAddressUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly addressRepositoy: AddressRepositoy,
    private readonly addressService: AddressService,
    private readonly addressMapper: AddressMapper,
  ) {}

  async execute(userId: string, newAddress: Address): Promise<void> {
    const user = await this.userRepository.findOne({ userId: userId });

    if (user == undefined || user == null) {
      throw new NotFoundItem();
    }

    if (!user.active) {
      throw new NotFoundItem();
    }

    let cepResponse: AxiosResponse<SearchCEPBrasilAPI, any>;

    try {
      cepResponse = await firstValueFrom(
        this.addressService.searchCEP(newAddress.postalCode.getValue()),
      );
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === HttpStatus.NOT_FOUND) {
          throw new FieldInvalid('O CEP informado não existe.', 'postalCode');
        }

        if (error.response?.status >= 500) {
          throw new ExternalServiceError(
            'Serviço de CEP temporariamente indisponível. Tente novamente mais tarde.',
          );
        }

        throw new ExternalServiceError(
          'Erro inesperado ao consultar o CEP. Tente novamente mais tarde.',
        );
      }
    }

    const data = cepResponse.data as BrasilAPICEP;

    newAddress.state.validateInPostalCode(data.state);
    newAddress.city.validateInPostalCode(data.city);
    newAddress.neighborhood.validateInPostalCode(data.neighborhood);
    newAddress.street.validateInPostalCode(data.street);

    await this.addressRepositoy.addAddress(
      this.addressMapper.addressForEntity(newAddress),
    );
  }
}
