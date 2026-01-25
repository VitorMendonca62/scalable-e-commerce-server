import { AddressEntity } from '@modules/user/domain/entities/address.entity';
import { Injectable } from '@nestjs/common';
import AddressRepository from '@user/domain/ports/secondary/address-repository.port';
import { AddressMapper } from '@user/infrastructure/mappers/address.mapper';
import {
  AddUserAddressPort,
  ExecuteReturn,
} from '@modules/user/domain/ports/application/address/add-user-address.port';
import { ApplicationResultReasons } from '@modules/user/domain/enums/application-result-reasons';

@Injectable()
export class AddUserAddressUseCase implements AddUserAddressPort {
  constructor(
    private readonly addressRepositoy: AddressRepository,
    private readonly addressMapper: AddressMapper,
  ) {}

  async execute(newAddress: AddressEntity): Promise<ExecuteReturn> {
    if (
      (await this.addressRepositoy.countAddresses(
        newAddress.userID.getValue(),
      )) >= 3
    ) {
      return {
        ok: false,
        message:
          'O usuário já possui o número máximo de endereços permitidos (3).',
        reason: ApplicationResultReasons.BUSINESS_RULE_FAILURE,
      };
    }
    await this.addressRepositoy.addAddress(
      this.addressMapper.entityForModel(newAddress),
    );

    return { ok: true };
  }
}
