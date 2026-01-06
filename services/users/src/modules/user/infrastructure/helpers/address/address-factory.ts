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
import { AddressValuesObjectFactory } from './address-values-object-factory';
import { Address } from '@modules/user/domain/entities/address.entity';
import { AddressEntity } from '../../adaptars/secondary/database/entities/address.entity';
import { IDConstants } from '@modules/user/domain/values-objects/uuid/id-constants';

export class AddressDTO {
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
  static createModel(
    overrides: Partial<Record<keyof Address, any>> = {},
  ): Address {
    const vos = AddressValuesObjectFactory.getObjects([
      'city',
      'complement',
      'country',
      'neighborhood',
      'number',
      'postalCode',
      'state',
      'street',
      'userId',
    ]);

    const data: Record<keyof Address, any> = {
      number: vos['number']!,
      street: vos['street']!,
      complement: vos['complement']!,
      neighborhood: vos['neighborhood']!,
      city: vos['city']!,
      postalCode: vos['postalCode']!,
      state: vos['state']!,
      country: vos['country']!,
      id: 1,
      userId: vos['userId'],
      createdAt: new Date('2025-09-02T13:30:08.633Z'),
      updatedAt: new Date('2025-09-02T13:30:08.633Z'),
      ...overrides,
    };
    return new Address(data);
  }

  static createEntity(
    overrides: Partial<Record<keyof Address, any>> = {},
  ): AddressEntity {
    const data: Record<keyof Address, any> = {
      createdAt: new Date('2025-09-02T13:30:08.633Z'),
      updatedAt: new Date('2025-09-02T13:30:08.633Z'),
      number: NumberConstants.EXEMPLE,
      street: StreetConstants.EXEMPLE,
      complement: ComplementConstants.EXEMPLE,
      neighborhood: NeighborhoodConstants.EXEMPLE,
      city: CityConstants.EXEMPLE,
      postalCode: PostalCodeConstants.EXEMPLE,
      state: StateConstants.EXEMPLE,
      country: CountryConstants.EXEMPLE,
      userId: IDConstants.EXEMPLE,
      id: 2,
      ...overrides,
    };
    return data as unknown as AddressEntity;
  }
}

