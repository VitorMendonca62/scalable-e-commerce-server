import IDConstants from '@modules/user/domain/values-objects/common/uuid/id-constants';
import { AddressDTOFactory, AddressFactory } from '../helpers/address/factory';

import { AddressMapper } from './address.mapper';
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

import {
  mockCityConstructor,
  mockComplementConstructor,
  mockCountryConstructor,
  mockNeighborhoodConstructor,
  mockNumberConstructor,
  mockPostalCodeConstructor,
  mockStateConstructor,
  mockStreetConstructor,
} from '../helpers/address/values-objects-mock';
import { mockIDConstructor } from '../helpers/values-objects-mock';
import { IDVO } from '@modules/user/domain/values-objects/common/value-object';

describe('AddressMapper', () => {
  let mapper: AddressMapper;

  beforeEach(async () => {
    mapper = new AddressMapper();
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  const dateNow = new Date();

  describe('addUserAddressDTOForEntity', () => {
    const dto = AddressDTOFactory.createAddUserAddressDTO();
    const userID = IDConstants.EXEMPLE;

    it('should call VOs with correct parameters', async () => {
      mapper.addUserAddressDTOForEntity(dto, userID);

      expect(mockCityConstructor).toHaveBeenCalledWith(dto.city);
      expect(mockComplementConstructor).toHaveBeenCalledWith(dto.complement);
      expect(mockNeighborhoodConstructor).toHaveBeenCalledWith(
        dto.neighborhood,
      );
      expect(mockNumberConstructor).toHaveBeenCalledWith(dto.number);
      expect(mockPostalCodeConstructor).toHaveBeenCalledWith(dto.postalCode);
      expect(mockCountryConstructor).toHaveBeenCalledWith(dto.country);
      expect(mockStateConstructor).toHaveBeenCalledWith(dto.state);
      expect(mockStreetConstructor).toHaveBeenCalledWith(dto.street);
      expect(mockIDConstructor).toHaveBeenCalledWith(userID);
    });

    it('should return User with correct types', async () => {
      const address = mapper.addUserAddressDTOForEntity(dto, userID);

      expect(address.city).toBeInstanceOf(CityVO);
      expect(address.complement).toBeInstanceOf(ComplementVO);
      expect(address.neighborhood).toBeInstanceOf(NeighborhoodVO);
      expect(address.number).toBeInstanceOf(NumberVO);
      expect(address.postalCode).toBeInstanceOf(PostalCodeVO);
      expect(address.country).toBeInstanceOf(CountryVO);
      expect(address.state).toBeInstanceOf(StateVO);
      expect(address.street).toBeInstanceOf(StreetVO);
      expect(address.userID).toBeInstanceOf(IDVO);
      expect(address.createdAt).toBeInstanceOf(Date);
      expect(address.updatedAt).toBeInstanceOf(Date);
    });

    it('should return User with correct fields', async () => {
      const address = mapper.addUserAddressDTOForEntity(dto, userID);

      expect(address.city.getValue()).toBe(dto.city);
      expect(address.complement.getValue()).toBe(dto.complement);
      expect(address.neighborhood.getValue()).toBe(dto.neighborhood);
      expect(address.number.getValue()).toBe(dto.number);
      expect(address.postalCode.getValue()).toBe(dto.postalCode);
      expect(address.country.getValue()).toBe(dto.country);
      expect(address.state.getValue()).toBe(dto.state);
      expect(address.street.getValue()).toBe(dto.street);
      expect(address.userID.getValue()).toBe(userID);
      expect(address.createdAt.getTime()).toBe(dateNow.getTime());
      expect(address.updatedAt.getTime()).toBe(dateNow.getTime());
    });
  });

  describe('entityForModel', () => {
    const address = AddressFactory.createEntity();

    it('should return correct JSON structure', () => {
      const result = mapper.entityForModel(address);

      expect(result).toHaveProperty('city');
      expect(result).toHaveProperty('complement');
      expect(result).toHaveProperty('neighborhood');
      expect(result).toHaveProperty('number');
      expect(result).toHaveProperty('postalCode');
      expect(result).toHaveProperty('country');
      expect(result).toHaveProperty('state');
      expect(result).toHaveProperty('street');
      expect(result).toHaveProperty('createdAt');
    });

    it('should preserve primitive types', () => {
      const result = mapper.entityForModel(address);

      expect(typeof result.city).toBe('string');
      expect(typeof result.complement).toBe('string');
      expect(typeof result.neighborhood).toBe('string');
      expect(typeof result.number).toBe('string');
      expect(typeof result.postalCode).toBe('string');
      expect(typeof result.country).toBe('string');
      expect(typeof result.state).toBe('string');
      expect(typeof result.street).toBe('string');
      expect(typeof result.createdAt).toBe('object');
    });

    it('should return correct values', () => {
      const result = mapper.entityForModel(address);

      expect(result.city).toBe(address.city.getValue());
      expect(result.complement).toBe(address.complement.getValue());
      expect(result.neighborhood).toBe(address.neighborhood.getValue());
      expect(result.number).toBe(address.number.getValue());
      expect(result.postalCode).toBe(address.postalCode.getValue());
      expect(result.country).toBe(address.country.getValue());
      expect(result.state).toBe(address.state.getValue());
      expect(result.street).toBe(address.street.getValue());
      expect(result.createdAt).toBe(address.createdAt);
    });
  });
});
