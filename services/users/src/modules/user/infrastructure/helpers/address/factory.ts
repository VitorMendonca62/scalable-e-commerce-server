import { AddUserAddressDTO } from '../../adaptars/primary/http/dtos/add-user-address.dto';
import {
  CityConstants,
  ComplementConstants,
  CountryConstants,
  NeighborhoodConstants,
  NumberConstants,
  PostalCodeConstants,
  StateConstants,
  StreetConstants,
} from '@modules/user/domain/values-objects/address/constants';
import { AddressEntity } from '@modules/user/domain/entities/address.entity';
import { IDConstants } from '@modules/user/domain/values-objects/common/constants';
import {
  CityVO,
  ComplementVO,
  CountryVO,
  NeighborhoodVO,
  NumberVO,
  PostalCodeVO,
  StateVO,
  StreetVO,
} from '@modules/user/domain/values-objects/address/values-object';
import { IDVO } from '@modules/user/domain/values-objects/common/value-object';
import AddressModel from '../../adaptars/secondary/database/models/address.model';
import { UserFactory } from '../users/factory';

export class AddressDTOFactory {
  static createAddUserAddressDTO(
    overrides: Partial<
      Record<
        keyof AddUserAddressDTO,
        AddUserAddressDTO[keyof AddUserAddressDTO]
      >
    > = {},
  ): AddUserAddressDTO {
    return {
      city: CityConstants.EXEMPLE,
      complement: ComplementConstants.EXEMPLE,
      country: CountryConstants.EXEMPLE,
      neighborhood: NeighborhoodConstants.EXEMPLE,
      number: NumberConstants.EXEMPLE,
      postalCode: PostalCodeConstants.EXEMPLE,
      state: StateConstants.EXEMPLE,
      street: StreetConstants.EXEMPLE,
      ...overrides,
    } as AddUserAddressDTO;
  }

  static createAddUserAddressDTOLikeInstance(
    overrides: Partial<AddUserAddressDTO> = {},
  ): AddUserAddressDTO {
    const dto = new AddUserAddressDTO();

    dto.city = overrides.city ?? CityConstants.EXEMPLE;
    dto.complement = overrides.complement ?? ComplementConstants.EXEMPLE;
    dto.country = overrides.country ?? CountryConstants.EXEMPLE;
    dto.neighborhood = overrides.neighborhood ?? NeighborhoodConstants.EXEMPLE;
    dto.number = overrides.number ?? NumberConstants.EXEMPLE;
    dto.postalCode = overrides.postalCode ?? PostalCodeConstants.EXEMPLE;
    dto.state = overrides.state ?? StateConstants.EXEMPLE;
    dto.street = overrides.street ?? StreetConstants.EXEMPLE;
    return dto;
  }
}

export class AddressFactory {
  static createEntity(overrides: Partial<AddressEntity> = {}): AddressEntity {
    const data: Record<keyof AddressEntity, any> = {
      city: new CityVO(CityConstants.EXEMPLE),
      complement: new ComplementVO(ComplementConstants.EXEMPLE),
      neighborhood: new NeighborhoodVO(NeighborhoodConstants.EXEMPLE),
      number: new NumberVO(NumberConstants.EXEMPLE),
      postalCode: new PostalCodeVO(PostalCodeConstants.EXEMPLE),
      country: new CountryVO(CountryConstants.EXEMPLE),
      state: new StateVO(StateConstants.EXEMPLE),
      street: new StreetVO(StreetConstants.EXEMPLE),
      userID: new IDVO(IDConstants.EXEMPLE),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
    return new AddressEntity(data);
  }

  static createModel(overrides: Partial<AddressModel> = {}): AddressModel {
    return {
      number: NumberConstants.EXEMPLE,
      street: StreetConstants.EXEMPLE,
      complement: ComplementConstants.EXEMPLE,
      neighborhood: NeighborhoodConstants.EXEMPLE,
      city: CityConstants.EXEMPLE,
      postalCode: PostalCodeConstants.EXEMPLE,
      state: StateConstants.EXEMPLE,
      country: CountryConstants.EXEMPLE,
      createdAt: new Date(),
      id: 1,
      ...overrides,
    };
  }
}
