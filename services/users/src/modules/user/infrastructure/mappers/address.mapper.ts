import { Injectable } from '@nestjs/common';
import IDVO from '@user/domain/values-objects/uuid/id-vo';
import { AddUserAddressDTO } from '../adaptars/primary/http/dtos/add-user-address.dto';
import { Address } from '@user/domain/entities/address.entity';
import { AddressEntity } from '../adaptars/secondary/database/entities/address.entity';
import {
  CityVO,
  ComplementVO,
  NeighborhoodVO,
  NumberVO,
  PostalCodeVO,
  CountryVO,
  StateVO,
  StreetVO,
} from '@modules/user/domain/values-objects/address/values-object';

@Injectable()
export class AddressMapper {
  addUserAddressDTOForModel(dto: AddUserAddressDTO, userId: string) {
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

  addressModelForEntity(entity: Address): AddressEntity {
    return {
      id: entity.id,
      city: entity.city.getValue(),
      complement: entity.complement.getValue(),
      neighborhood: entity.neighborhood.getValue(),
      number: entity.number.getValue(),
      postalCode: entity.postalCode.getValue(),
      country: entity.country.getValue(),
      state: entity.state.getValue(),
      street: entity.street.getValue(),
      userId: entity.userId.getValue(),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
