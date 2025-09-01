import { Injectable } from '@nestjs/common';
import IDVO from '@modules/user2/domain/values-objects/uuid/id-vo';
import { AddUserAddressDTO } from '../adaptars/primary/http/dtos/add-user-address.dto';
import { Address } from '@modules/user2/domain/entities/address.entity';
import CityVO from '@modules/user2/domain/values-objects/address/city/city-vo';
import ComplementVO from '@modules/user2/domain/values-objects/address/complement/complement-vo';
import NeighborhoodVO from '@modules/user2/domain/values-objects/address/neighborhood/neighborhood-vo';
import NumberVO from '@modules/user2/domain/values-objects/address/number/number-vo';
import PostalCodeVO from '@modules/user2/domain/values-objects/address/postal-code/postal-code-vo';
import CountryVO from '@modules/user2/domain/values-objects/address/country/country-vo';
import StateVO from '@modules/user2/domain/values-objects/address/state/state-vo';
import StreetVO from '@modules/user2/domain/values-objects/address/street/street-vo';
import { AddressEntity } from '../adaptars/secondary/database/entities/address.entity';

@Injectable()
export class AddressMapper {
  addUserAddressDTOForEntity(dto: AddUserAddressDTO, userId: string) {
    const dateNow = new Date();
    return new Address({
      city: new CityVO(dto.city),
      complement: new ComplementVO(dto.complement),
      neighborhood: new NeighborhoodVO(dto.neighborhood),
      number: new NumberVO(dto.number),
      postalCode: new PostalCodeVO(dto.postalCode),
      country: new CountryVO(dto.country),
      state: new StateVO(dto.state),
      street: new StreetVO(dto.street),
      userId: new IDVO(userId),
      createdAt: dateNow,
      updatedAt: dateNow,
    });
  }

  addressForEntity(entity: Address): Record<keyof AddressEntity, any> {
    return {
      id: entity.id,
      city: `${entity.city}`,
      complement: `${entity.complement}`,
      neighborhood: `${entity.neighborhood}`,
      number: `${entity.number}`,
      postalCode: `${entity.postalCode}`,
      country: `${entity.country}`,
      state: `${entity.state}`,
      street: `${entity.street}`,
      userId: `${entity.userId}`,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
