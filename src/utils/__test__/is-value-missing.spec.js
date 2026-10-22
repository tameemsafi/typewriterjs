import isValueMissing from '../is-value-missing';

describe('isValueMissing', () => {
  it('should return true if value is undefined or null', () => {
    expect(isValueMissing(undefined)).toEqual(true);
    expect(isValueMissing(null)).toEqual(true);
  });

  it('should return false if value is zero or any other value', () => {
    expect(isValueMissing(0)).toEqual(false);
    expect(isValueMissing(50)).toEqual(false);
    expect(isValueMissing('natural')).toEqual(false);
  });
});
