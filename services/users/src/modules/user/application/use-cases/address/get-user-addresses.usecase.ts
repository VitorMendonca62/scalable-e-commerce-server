import AddressRepository from '@user/domain/ports/secondary/address-repository.port';
import { Injectable } from '@nestjs/common';
import {
  ExecuteReturn,
  GetUserAddressesPort,
} from '@modules/user/domain/ports/application/address/get-user-addresses.port';
import { ApplicationResultReasons } from '@modules/user/domain/enums/application-result-reasons';

@Injectable()
export class GetUserAddressesUseCase implements GetUserAddressesPort {
  constructor(private readonly addressRepositoy: AddressRepository) {}

  async execute(userID: string): Promise<ExecuteReturn> {
    const addresses = await this.addressRepositoy.getAll(userID);

    if (addresses.length === 0) {
      return {
        ok: false,
        message: 'Não foi possível encontrar os endereços do usuário.',
        reason: ApplicationResultReasons.NOT_FOUND,
      };
    }

    return {
      ok: true,
      result: addresses.map((address, index) => ({
        id: index,
        city: address.city,
        complement: address.complement,
        country: address.country,
        neighborhood: address.neighborhood,
        number: address.number,
        postalCode: address.postalCode,
        state: address.state,
        street: address.street,
      })),
    };
  }
}
