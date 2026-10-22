import splitIntoGraphemes from '../split-into-graphemes';

describe('splitIntoGraphemes', () => {
  it('should keep emojis as a single character', () => {
    expect(splitIntoGraphemes('hi 😋')).toEqual(['h', 'i', ' ', '😋']);
  });

  it('should keep joined emojis and combining marks together', () => {
    expect(splitIntoGraphemes('👨‍👩‍👧é')).toEqual(['👨‍👩‍👧', 'é']);
  });

  it('should split by code points when Intl.Segmenter is not available', () => {
    const { Segmenter } = Intl;
    delete Intl.Segmenter;

    expect(splitIntoGraphemes('a😋')).toEqual(['a', '😋']);

    Intl.Segmenter = Segmenter;
  });
});
