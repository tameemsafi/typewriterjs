import isVoidElement from '../is-void-element';

describe('isVoidElement', () => {
  it('should return true for elements that can not have content', () => {
    expect(isVoidElement(document.createElement('br'))).toEqual(true);
    expect(isVoidElement(document.createElement('img'))).toEqual(true);
    expect(isVoidElement(document.createElement('hr'))).toEqual(true);
  });

  it('should return false for elements that can have content', () => {
    expect(isVoidElement(document.createElement('strong'))).toEqual(false);
    expect(isVoidElement(document.createElement('span'))).toEqual(false);
  });

  it('should return false for nodes without a name', () => {
    expect(isVoidElement({})).toEqual(false);
  });
});
