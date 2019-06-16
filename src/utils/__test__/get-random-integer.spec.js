import getRandomInteger from '../get-random-integer';

describe('getRandomInteger', () => {
  it('should return a random integer between min and max values', () => {
    expect(getRandomInteger(1, 10)).toBeGreaterThanOrEqual(1);
    expect(getRandomInteger(1, 10)).toBeLessThanOrEqual(10);
  })
})