import doesStringContainHTMLTag from '../does-string-contain-html-tag';

describe('doesStringContainHTMLTag', () => {
  it('should return true if string contains html', () => {
    expect(doesStringContainHTMLTag('Hello <strong>world</strong>!')).toEqual(true);
  });

  it('should return false if string does not contain html', () => {
    expect(doesStringContainHTMLTag('Hello world!')).toEqual(false);
  });
})