import { FieldInvalid } from '@modules/user2/domain/ports/primary/http/error.port';
import { DistrictConstants } from './district-constants';
import { DistrictValidator } from './district-validator';

describe('DistrictValidator', () => {
  it('should not throw if district is valid', () => {
    const validDistrict = DistrictConstants.EXEMPLE;

    expect(() => DistrictValidator.validate(validDistrict)).not.toThrow();
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
      expect(() => DistrictValidator.validate(district)).not.toThrow();
    });
  });

  it('should throw if district is empty', () => {
    expect(() => DistrictValidator.validate('')).toThrow(
      new FieldInvalid(DistrictConstants.ERROR_REQUIRED, 'district'),
    );
  });

  it('should throw if district is not a string', () => {
    expect(() => DistrictValidator.validate(123 as any)).toThrow(
      new FieldInvalid(DistrictConstants.ERROR_STRING, 'district'),
    );
  });

  it('should throw if district is too short', () => {
    const shortDistrict = DistrictConstants.ERROR_TOO_SHORT_EXEMPLE;

    expect(() => DistrictValidator.validate(shortDistrict)).toThrow(
      new FieldInvalid(DistrictConstants.ERROR_TOO_SHORT, 'district'),
    );
  });

  it('should throw if district is too long', () => {
    const longDistrict = DistrictConstants.ERROR_TOO_LONG_EXEMPLE;

    expect(() => DistrictValidator.validate(longDistrict)).toThrow(
      new FieldInvalid(DistrictConstants.ERROR_TOO_LONG, 'district'),
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
      expect(() => DistrictValidator.validate(district)).toThrow(
        new FieldInvalid(DistrictConstants.ERROR_INVALID, 'district'),
      );
    });
  });
});
