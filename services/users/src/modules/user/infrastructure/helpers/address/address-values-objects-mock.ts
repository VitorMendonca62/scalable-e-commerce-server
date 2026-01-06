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
import { IDConstants } from '@modules/user/domain/values-objects/uuid/id-constants';

export function mockAddressValueObjects() {
  const MockStreet = jest.fn();
  MockStreet.prototype.getValue = jest.fn().mockReturnValue(StreetConstants.EXEMPLE);

  const MockNumber = jest.fn();
  MockNumber.prototype.getValue = jest.fn().mockReturnValue(NumberConstants.EXEMPLE);

  const MockNeighborhood = jest.fn();
  MockNeighborhood.prototype.getValue = jest.fn().mockReturnValue(NeighborhoodConstants.EXEMPLE);

  const MockComplement = jest.fn();
  MockComplement.prototype.getValue = jest.fn().mockReturnValue(ComplementConstants.EXEMPLE);

  const MockCity = jest.fn();
  MockCity.prototype.getValue = jest.fn().mockReturnValue(CityConstants.EXEMPLE);

  const MockPostalCode = jest.fn();
  MockPostalCode.prototype.getValue = jest.fn().mockReturnValue(PostalCodeConstants.EXEMPLE);

  const MockState = jest.fn();
  MockState.prototype.getValue = jest.fn().mockReturnValue(StateConstants.EXEMPLE);

  const MockCountry = jest.fn();
  MockCountry.prototype.getValue = jest.fn().mockReturnValue(CountryConstants.EXEMPLE);

  const mockID = jest.fn();
  mockID.prototype.toString = jest.fn().mockReturnValue(IDConstants.EXEMPLE);
  mockID.prototype.getValue = jest.fn().mockReturnValue(IDConstants.EXEMPLE);

  jest.mock(
    '@modules/user/domain/values-objects/address/street/street-vo',
    () => ({ __esModule: true, default: MockStreet }),
  );

  jest.mock(
    '@modules/user/domain/values-objects/address/number/number-vo',
    () => ({ __esModule: true, default: MockNumber }),
  );

  jest.mock(
    '@modules/user/domain/values-objects/address/neighborhood/neighborhood-vo',
    () => ({ __esModule: true, default: MockNeighborhood }),
  );

  jest.mock(
    '@modules/user/domain/values-objects/address/complement/complement-vo',
    () => ({ __esModule: true, default: MockComplement }),
  );

  jest.mock('@modules/user/domain/values-objects/address/city/city-vo', () => ({
    __esModule: true,
    default: MockCity,
  }));

  jest.mock(
    '@modules/user/domain/values-objects/address/postal-code/postal-code-vo',
    () => ({ __esModule: true, default: MockPostalCode }),
  );

  jest.mock(
    '@modules/user/domain/values-objects/address/state/state-vo',
    () => ({ __esModule: true, default: MockState }),
  );

  jest.mock(
    '@modules/user/domain/values-objects/address/country/country-vo',
    () => ({ __esModule: true, default: MockCountry }),
  );

  jest.mock('@modules/user/domain/values-objects/uuid/id-vo', () => ({
    __esModule: true,
    default: mockID,
  }));
}
