import { AddressDTOFactory } from '@modules/user/infrastructure/helpers/address/factory';
import { validate } from 'class-validator';
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

describe('AddUserAddressDTO', () => {
  it('should sucess validation when all fields are valid', async () => {
    const errors = await validate(
      AddressDTOFactory.createAddUserAddressDTOLikeInstance(),
    );
    expect(errors).toHaveLength(0);
  });

  it('should return error when any field is undefined', async () => {
    const requiredFields = {
      number: NumberConstants.ERROR_REQUIRED,
      street: StreetConstants.ERROR_REQUIRED,
      neighborhood: NeighborhoodConstants.ERROR_REQUIRED,
      city: CityConstants.ERROR_REQUIRED,
      postalCode: PostalCodeConstants.ERROR_REQUIRED,
      state: StateConstants.ERROR_REQUIRED,
      country: CountryConstants.ERROR_REQUIRED,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = AddressDTOFactory.createAddUserAddressDTOLikeInstance({
        [key]: "",
      });

      const errors = await validate(dto);
      const fieldError = errors[0];

      expect(errors).toHaveLength(1);
      expect(fieldError.value).toBe("");
      expect(fieldError.property).toBe(key);
      expect(fieldError.constraints.isNotEmpty).toBe(message);
    });
  });

  it('should return error when any field is not string', async () => {
    const requiredFields = {
      number: NumberConstants.ERROR_STRING,
      street: StreetConstants.ERROR_STRING,
      complement: ComplementConstants.ERROR_STRING,
      neighborhood: NeighborhoodConstants.ERROR_STRING,
      city: CityConstants.ERROR_STRING,
      postalCode: PostalCodeConstants.ERROR_STRING,
      state: StateConstants.ERROR_STRING,
      country: CountryConstants.ERROR_STRING,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = AddressDTOFactory.createAddUserAddressDTOLikeInstance({
        [key]: 12345,
      });

      const errors = await validate(dto);
      const fieldError = errors[0];

      expect(fieldError.constraints.isString).toBe(message);
    });
  });

  it('should return error when any field is shorter than the allowed length', async () => {
    const requiredFields = {
      street: StreetConstants.ERROR_TOO_SHORT,
      neighborhood: NeighborhoodConstants.ERROR_TOO_SHORT,
      city: CityConstants.ERROR_TOO_SHORT,
      state: StateConstants.ERROR_TOO_SHORT,
      country: CountryConstants.ERROR_TOO_SHORT,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = AddressDTOFactory.createAddUserAddressDTOLikeInstance({
        [key]: 'a',
      });

      const errors = await validate(dto);
      const fieldError = errors[0];
      expect(fieldError.constraints.minLength).toBe(message);
    });
  });

  it('should return error when any field is bigger than the allowed length', async () => {
    const requiredFields = {
      city: CityConstants.ERROR_TOO_LONG,
      complement: ComplementConstants.ERROR_TOO_LONG,
      country: CountryConstants.ERROR_TOO_LONG,
      neighborhood: NeighborhoodConstants.ERROR_TOO_LONG,
      number: NumberConstants.ERROR_TOO_LONG,
      street: StreetConstants.ERROR_TOO_LONG,
      state: StateConstants.ERROR_TOO_LONG,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = AddressDTOFactory.createAddUserAddressDTOLikeInstance({
        [key]: 'a'.repeat(1000),
      });

      const errors = await validate(dto);
      const fieldError = errors[0];
      expect(fieldError.constraints.maxLength).toBe(message);
    });
  });

  it('should return error when postalCode have incorrect length', async () => {
    const dto = AddressDTOFactory.createAddUserAddressDTOLikeInstance({
      postalCode: PostalCodeConstants.ERROR_LENGTH_EXEMPLE,
    });

    const errors = await validate(dto);
    const fieldError = errors[0];
    expect(fieldError.constraints.isLength).toBe(
      PostalCodeConstants.ERROR_LENGTH,
    );
  });

  it('should return error when postalCode is not is number string', async () => {
    const dto = AddressDTOFactory.createAddUserAddressDTOLikeInstance({
      postalCode: PostalCodeConstants.ERROR_INVALID_EXEMPLE,
    });

    const errors = await validate(dto);
    const fieldError = errors[0];
    expect(fieldError.constraints.isNumberString).toBe(
      PostalCodeConstants.ERROR_INVALID,
    );
  });
});
