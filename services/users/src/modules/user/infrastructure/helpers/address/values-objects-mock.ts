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
import { type Mock } from 'vitest';

// Mock City

export const mockCityConstructor: Mock = vi.fn();
export const mockCityGetValue: Mock = vi
  .fn()
  .mockReturnValue(CityConstants.EXEMPLE);
class MockCity {
  constructor(value?: string) {
    mockCityConstructor(value);
  }
  getValue = mockCityGetValue;
}

// Mock Complement

export const mockComplementConstructor: Mock = vi.fn();
export const mockComplementGetValue: Mock = vi
  .fn()
  .mockReturnValue(ComplementConstants.EXEMPLE);
class MockComplement {
  constructor(value?: string) {
    mockComplementConstructor(value);
  }
  getValue = mockComplementGetValue;
}

// Mock Country

export const mockCountryConstructor: Mock = vi.fn();
export const mockCountryGetValue: Mock = vi
  .fn()
  .mockReturnValue(CountryConstants.EXEMPLE);
class MockCountry {
  constructor(value?: string) {
    mockCountryConstructor(value);
  }
  getValue = mockCountryGetValue;
}

// Mock Neighborhood

export const mockNeighborhoodConstructor: Mock = vi.fn();
export const mockNeighborhoodGetValue: Mock = vi
  .fn()
  .mockReturnValue(NeighborhoodConstants.EXEMPLE);
class MockNeighborhood {
  constructor(value?: string) {
    mockNeighborhoodConstructor(value);
  }
  getValue = mockNeighborhoodGetValue;
}

// Mock Number

export const mockNumberConstructor: Mock = vi.fn();
export const mockNumberGetValue: Mock = vi
  .fn()
  .mockReturnValue(NumberConstants.EXEMPLE);
class MockNumber {
  constructor(value?: string) {
    mockNumberConstructor(value);
  }
  getValue = mockNumberGetValue;
}

// Mock PostalCode

export const mockPostalCodeConstructor: Mock = vi.fn();
export const mockPostalCodeGetValue: Mock = vi
  .fn()
  .mockReturnValue(PostalCodeConstants.EXEMPLE);
class MockPostalCode {
  constructor(value?: string) {
    mockPostalCodeConstructor(value);
  }
  getValue = mockPostalCodeGetValue;
}

// Mock State

export const mockStateConstructor: Mock = vi.fn();
export const mockStateGetValue: Mock = vi
  .fn()
  .mockReturnValue(StateConstants.EXEMPLE);
class MockState {
  constructor(value?: string) {
    mockStateConstructor(value);
  }
  getValue = mockStateGetValue;
}

// Mock Street

export const mockStreetConstructor: Mock = vi.fn();
export const mockStreetGetValue: Mock = vi
  .fn()
  .mockReturnValue(StreetConstants.EXEMPLE);
class MockStreet {
  constructor(value?: string) {
    mockStreetConstructor(value);
  }
  getValue = mockStreetGetValue;
}

vi.mock('@modules/user/domain/values-objects/address/values-object', () => {
  return {
    CityVO: MockCity,
    ComplementVO: MockComplement,
    CountryVO: MockCountry,
    NumberVO: MockNumber,
    PostalCodeVO: MockPostalCode,
    StateVO: MockState,
    StreetVO: MockStreet,
    NeighborhoodVO: MockNeighborhood,
  };
});
