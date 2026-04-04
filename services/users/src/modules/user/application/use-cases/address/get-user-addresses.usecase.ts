import AddressRepository from '@user/domain/ports/secondary/address-repository.port';
import { Injectable } from '@nestjs/common';
import {
  ExecuteReturn,
  GetUserAddressesPort,
} from '@user/domain/ports/application/address/get-user-addresses.port';
import { ApplicationResultReasons } from '@user/domain/enums/application-result-reasons';

@Injectable()
export class GetUserAddressesUseCase implements GetUserAddressesPort {
  constructor(private readonly addressRepository: AddressRepository) {}

  async execute(userID: string): Promise<ExecuteReturn> {
    try {
      const addresses = await this.addressRepository.getAll(userID);

      if (addresses.length === 0) {
        return {
          ok: false,
          message: 'Não foi possível encontrar os endereços do usuário.',
          reason: ApplicationResultReasons.NOT_FOUND,
        };
      }

      return {
        ok: true,
        result: addresses.map((address) => ({
          addressId: address.id,
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        message: 'Não foi possivel buscar os endereços do usuário.',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }
  }
}
