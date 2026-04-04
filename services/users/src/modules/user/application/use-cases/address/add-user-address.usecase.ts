import { AddressEntity } from '@user/domain/entities/address.entity';
import { Injectable } from '@nestjs/common';
import AddressRepository from '@user/domain/ports/secondary/address-repository.port';
import { AddressMapper } from '@user/infrastructure/mappers/address.mapper';
import {
  AddUserAddressPort,
  ExecuteReturn,
} from '@user/domain/ports/application/address/add-user-address.port';
import { ApplicationResultReasons } from '@user/domain/enums/application-result-reasons';

@Injectable()
export class AddUserAddressUseCase implements AddUserAddressPort {
  constructor(
    private readonly addressRepository: AddressRepository,
    private readonly addressMapper: AddressMapper,
  ) {}

  async execute(newAddress: AddressEntity): Promise<ExecuteReturn> {
    try {
      const addressesCount = await this.addressRepository.countAddresses(
        newAddress.userID.getValue(),
      );

      if (addressesCount >= 3) {
        return {
          ok: false,
          message:
            'O usuário já possui o número máximo de endereços permitidos (3).',
          reason: ApplicationResultReasons.BUSINESS_RULE_FAILURE,
        };
      }

      await this.addressRepository.addAddress(
        newAddress.userID.getValue(),
        this.addressMapper.entityForModel(newAddress),
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        message: 'Não foi possivel adicionar o endereço',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }

    return { ok: true };
  }
}
