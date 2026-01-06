import { mockAddressValueObjects } from '../helpers/address/address-values-objects-mock';
mockAddressValueObjects();
import { IDConstants } from '@modules/user/domain/values-objects/uuid/id-constants';
import { AddressDTO, AddressFactory } from '../helpers/address/address-factory';

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

import IDVO from '@modules/user/domain/values-objects/uuid/id-vo';

describe('UserMapper', () => {
  let mapper: AddressMapper;

  beforeEach(async () => {
    mockAddressValueObjects();
    mapper = new AddressMapper();
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('addUserAddressDTOForModel', () => {
    const dto = AddressDTO.createAddUserAddressDTO();
    const userId = IDConstants.EXEMPLE;

    it('should call VOs with correct parameters', async () => {
      mapper.addUserAddressDTOForModel(dto, userId);

      expect(CityVO).toHaveBeenCalledWith(dto.city);
      expect(ComplementVO).toHaveBeenCalledWith(dto.complement);
      expect(NeighborhoodVO).toHaveBeenCalledWith(dto.neighborhood);
      expect(NumberVO).toHaveBeenCalledWith(dto.number);
      expect(PostalCodeVO).toHaveBeenCalledWith(dto.postalCode);
      expect(CountryVO).toHaveBeenCalledWith(dto.country);
      expect(StateVO).toHaveBeenCalledWith(dto.state);
      expect(StreetVO).toHaveBeenCalledWith(dto.street);
      expect(IDVO).toHaveBeenCalledWith(userId);
    });

    it('should return User with correct types', async () => {
      const address = mapper.addUserAddressDTOForModel(dto, userId);

      expect(address.city).toBeInstanceOf(CityVO);
      expect(address.complement).toBeInstanceOf(ComplementVO);
      expect(address.neighborhood).toBeInstanceOf(NeighborhoodVO);
      expect(address.number).toBeInstanceOf(NumberVO);
      expect(address.postalCode).toBeInstanceOf(PostalCodeVO);
      expect(address.country).toBeInstanceOf(CountryVO);
      expect(address.state).toBeInstanceOf(StateVO);
      expect(address.street).toBeInstanceOf(StreetVO);
      expect(address.userId).toBeInstanceOf(IDVO);
      expect(address.createdAt).toBeInstanceOf(Date);
      expect(address.updatedAt).toBeInstanceOf(Date);
    });

    it('should return User with correct fields', async () => {
      const address = mapper.addUserAddressDTOForModel(dto, userId);

      expect(address.city.getValue()).toBe(dto.city);
      expect(address.complement.getValue()).toBe(dto.complement);
      expect(address.neighborhood.getValue()).toBe(dto.neighborhood);
      expect(address.number.getValue()).toBe(dto.number);
      expect(address.postalCode.getValue()).toBe(dto.postalCode);
      expect(address.country.getValue()).toBe(dto.country);
      expect(address.state.getValue()).toBe(dto.state);
      expect(address.street.getValue()).toBe(dto.street);
      expect(address.userId.getValue()).toBe(userId);
    });

    it('should throw if any value object throws an error', () => {
      (IDVO as jest.Mock).mockImplementation(() => {
        throw new Error('Campo inválido');
      });

      expect(() => mapper.addUserAddressDTOForModel(dto, userId)).toThrow(
        'Campo inválido',
      );
      (IDVO as jest.Mock).mockRestore();
    });
  });

  describe('addressModelForEntity', () => {
    const address = AddressFactory.createModel();

    it('should return correct JSON structure', () => {
      const result = mapper.addressModelForEntity(address);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('city');
      expect(result).toHaveProperty('complement');
      expect(result).toHaveProperty('neighborhood');
      expect(result).toHaveProperty('number');
      expect(result).toHaveProperty('postalCode');
      expect(result).toHaveProperty('country');
      expect(result).toHaveProperty('state');
      expect(result).toHaveProperty('street');
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should preserve primitive types', () => {
      const result = mapper.addressModelForEntity(address);

      expect(typeof result.id).toBe('number');
      expect(typeof result.city).toBe('string');
      expect(typeof result.complement).toBe('string');
      expect(typeof result.neighborhood).toBe('string');
      expect(typeof result.number).toBe('string');
      expect(typeof result.postalCode).toBe('string');
      expect(typeof result.country).toBe('string');
      expect(typeof result.state).toBe('string');
      expect(typeof result.street).toBe('string');
      expect(typeof result.userId).toBe('string');
    });

    it('should return correct values', () => {
      const result = mapper.addressModelForEntity(address);

      expect(result.id).toBe(address.id);
      expect(result.city).toBe(address.city.getValue());
      expect(result.complement).toBe(address.complement.getValue());
      expect(result.neighborhood).toBe(address.neighborhood.getValue());
      expect(result.number).toBe(address.number.getValue());
      expect(result.postalCode).toBe(address.postalCode.getValue());
      expect(result.country).toBe(address.country.getValue());
      expect(result.state).toBe(address.state.getValue());
      expect(result.street).toBe(address.street.getValue());
      expect(result.userId).toBe(address.userId.getValue());
      expect(result.createdAt).toBe(address.createdAt);
      expect(result.updatedAt).toBe(address.updatedAt);
    });
  });
});
