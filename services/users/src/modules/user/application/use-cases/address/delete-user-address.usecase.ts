import { Injectable } from '@nestjs/common';
import AddressRepository from '@user/domain/ports/secondary/address-repository.port';
import {
  DeleteUserAddressPort,
  ExecuteReturn,
} from '@user/domain/ports/application/address/delete-user-address.port';
import { ApplicationResultReasons } from '@user/domain/enums/application-result-reasons';

@Injectable()
export class DeleteUserAddressUseCase implements DeleteUserAddressPort {
  constructor(private readonly addressRepository: AddressRepository) {}

  async execute(addressId: number, userID: string): Promise<ExecuteReturn> {
    try {
      const addresses = await this.addressRepository.getAll(userID);

      const addressExists = addresses.some(
        (address) => address.id === addressId,
      );

      if (!addressExists) {
        return {
          ok: false,
          message: 'Não foi possivel encontrar o endereço',
          reason: ApplicationResultReasons.NOT_FOUND,
        };
      }

      await this.addressRepository.delete(addressId);

      return {
        ok: true,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        message: 'Não foi possivel deletar o endereço',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }
  }
}
