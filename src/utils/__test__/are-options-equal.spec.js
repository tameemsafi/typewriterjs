import areOptionsEqual from '../are-options-equal';

describe('areOptionsEqual', () => {
  it('should return true if options have the same values', () => {
    const optionsA = { strings: ['Hello', 'World'], delay: 50, loop: true };
    const optionsB = { strings: ['Hello', 'World'], delay: 50, loop: true };
    expect(areOptionsEqual(optionsA, optionsB)).toEqual(true);
  });

  it('should return false if a value is different', () => {
    expect(areOptionsEqual({ delay: 50 }, { delay: 75 })).toEqual(false);
  });

  it('should return false if strings are different', () => {
    expect(areOptionsEqual({ strings: ['Hello'] }, { strings: ['World'] })).toEqual(false);
    expect(areOptionsEqual({ strings: ['Hello'] }, { strings: ['Hello', 'World'] })).toEqual(false);
  });

  it('should return false if an option is missing', () => {
    expect(areOptionsEqual({ delay: 50, loop: true }, { delay: 50 })).toEqual(false);
  });

  it('should treat two functions as equal', () => {
    const optionsA = { stringSplitter: (text) => text.split('') };
    const optionsB = { stringSplitter: (text) => text.split('') };
    expect(areOptionsEqual(optionsA, optionsB)).toEqual(true);
  });

  it('should return false if a function is added', () => {
    const optionsB = { stringSplitter: (text) => text.split('') };
    expect(areOptionsEqual({}, optionsB)).toEqual(false);
  });

  it('should handle missing options', () => {
    expect(areOptionsEqual(undefined, undefined)).toEqual(true);
    expect(areOptionsEqual(undefined, { delay: 50 })).toEqual(false);
    expect(areOptionsEqual(null, null)).toEqual(true);
  });
});
