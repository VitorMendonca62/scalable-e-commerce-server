import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';
import { NeighborhoodConstants } from './neighborhood-constants';
import { NeighborhoodValidator } from './neighborhood-validator';

describe('DistrictValidator', () => {
  it('should not throw if district is valid', () => {
    const validDistrict = NeighborhoodConstants.EXEMPLE;

    expect(() => NeighborhoodValidator.validate(validDistrict)).not.toThrow();
  });

  it('should not throw for valid districts with special characters', () => {
    const validDistricts = [
      'Vila Madalena',
      'Pinheiros',
      'Itaim Bibi',
      'Jardins',
      'Moema',
    ];

    validDistricts.forEach((district) => {
      expect(() => NeighborhoodValidator.validate(district)).not.toThrow();
    });
  });

  it('should throw if district is empty', () => {
    expect(() => NeighborhoodValidator.validate('')).toThrow(
      new FieldInvalid(NeighborhoodConstants.ERROR_REQUIRED, 'district'),
    );
  });

  it('should throw if district is not a string', () => {
    expect(() => NeighborhoodValidator.validate(123 as any)).toThrow(
      new FieldInvalid(NeighborhoodConstants.ERROR_STRING, 'district'),
    );
  });

  it('should throw if district is too short', () => {
    const shortDistrict = NeighborhoodConstants.ERROR_TOO_SHORT_EXEMPLE;

    expect(() => NeighborhoodValidator.validate(shortDistrict)).toThrow(
      new FieldInvalid(NeighborhoodConstants.ERROR_TOO_SHORT, 'district'),
    );
  });

  it('should throw if district is too long', () => {
    const longDistrict = NeighborhoodConstants.ERROR_TOO_LONG_EXEMPLE;

    expect(() => NeighborhoodValidator.validate(longDistrict)).toThrow(
      new FieldInvalid(NeighborhoodConstants.ERROR_TOO_LONG, 'district'),
    );
  });

  it('should throw if district contains invalid characters', () => {
    const invalidDistricts = [
      'Vila Madalena123',
      'District@',
      'Test#District',
      'Invalid$District',
    ];

    invalidDistricts.forEach((district) => {
      expect(() => NeighborhoodValidator.validate(district)).toThrow(
        new FieldInvalid(NeighborhoodConstants.ERROR_INVALID, 'district'),
      );
    });
  });
});
