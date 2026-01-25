import { Injectable } from '@nestjs/common';
import { AddUserAddressDTO } from '../adaptars/primary/http/dtos/add-user-address.dto';
import { AddressEntity } from '@modules/user/domain/entities/address.entity';
import AddressModel from '../adaptars/secondary/database/models/address.model';
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
import { IDVO } from '@modules/user/domain/values-objects/common/value-object';

@Injectable()
export class AddressMapper {
  addUserAddressDTOForEntity(dto: AddUserAddressDTO, userID: string) {
    const dateNow = new Date();
    return new AddressEntity({
      city: new CityVO(dto.city),
      complement: new ComplementVO(dto.complement),
      neighborhood: new NeighborhoodVO(dto.neighborhood),
      number: new NumberVO(dto.number),
      postalCode: new PostalCodeVO(dto.postalCode),
      country: new CountryVO(dto.country),
      state: new StateVO(dto.state),
      street: new StreetVO(dto.street),
      userID: new IDVO(userID),
      createdAt: dateNow,
      updatedAt: dateNow,
    });
  }

  entityForModel(entity: AddressEntity): Omit<AddressModel, 'id' | 'user'> {
    return {
      city: entity.city.getValue(),
      complement: entity.complement.getValue(),
      neighborhood: entity.neighborhood.getValue(),
      number: entity.number.getValue(),
      postalCode: entity.postalCode.getValue(),
      country: entity.country.getValue(),
      state: entity.state.getValue(),
      street: entity.street.getValue(),
      createdAt: entity.createdAt,
    };
  }
}
