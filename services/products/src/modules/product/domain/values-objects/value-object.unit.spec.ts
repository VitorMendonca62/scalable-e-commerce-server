import { ValueObject } from './value-object';

describe('ValueObject', () => {
  it('should store a value of any type', () => {
    const stringValue = 'Teste Unitário';
    const stringVO = new ValueObject(stringValue);
    expect(stringVO.getValue()).toBe(stringValue);
    expect(typeof stringVO.getValue()).toBe('string');

    const numberValue = 2;
    const numberVO = new ValueObject(numberValue);
    expect(numberVO.getValue()).toBe(numberValue);
    expect(typeof numberVO.getValue()).toBe('number');
  });
});
