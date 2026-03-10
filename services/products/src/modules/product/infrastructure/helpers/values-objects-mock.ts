import IDConstants from '@product/domain/values-objects/id/id-constants';
import { type Mock } from 'vitest';

// Mock ID

export const mockIDConstructor: Mock = vi.fn();
export const mockIDGetValue: Mock = vi
  .fn()
  .mockReturnValue(IDConstants.EXEMPLE);
class MockID {
  constructor(value: string) {
    mockIDConstructor(value);
  }
  getValue = mockIDGetValue;
}

vi.mock('@product/domain/values-objects/common/value-object', () => {
  return {
    IDVO: MockID,
  };
});
