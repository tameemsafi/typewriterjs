import isDelayRange from '../is-delay-range';

describe('isDelayRange', () => {
  it('should return true for an object with min and max numbers', () => {
    expect(isDelayRange({ min: 10, max: 20 })).toEqual(true);
  });

  it('should return false for other values', () => {
    expect(isDelayRange(null)).toEqual(false);
    expect(isDelayRange(50)).toEqual(false);
    expect(isDelayRange('natural')).toEqual(false);
    expect(isDelayRange({ min: 10 })).toEqual(false);
    expect(isDelayRange({ min: '10', max: 20 })).toEqual(false);
  });
});
