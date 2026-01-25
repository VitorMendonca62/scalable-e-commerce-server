import { Injectable } from '@nestjs/common';
import AddressRepository from '@user/domain/ports/secondary/address-repository.port';
import {
  DeleteUserAddressPort,
  ExecuteReturn,
} from '@modules/user/domain/ports/application/address/delete-user-address.port';
import { ApplicationResultReasons } from '@modules/user/domain/enums/application-result-reasons';

@Injectable()
export class DeleteUserAddressUseCase implements DeleteUserAddressPort {
  constructor(private readonly addressRepository: AddressRepository) {}

  async execute(addressIndex: number, userID: string): Promise<ExecuteReturn> {
    const addresses = await this.addressRepository.getAll(userID);

    if (addressIndex >= addresses.length) {
      return {
        ok: false,
        message: 'Não foi possivel encontrar o endereço',
        reason: ApplicationResultReasons.NOT_FOUND,
      };
    }

    await this.addressRepository.delete(addresses[addressIndex].id);

    return {
      ok: true,
    };
  }
}
