import getDOMElementFromString from '../get-dom-element-from-string';

describe('getDOMElementFromString', () => {
  it('should return correct dom elements from string', () => {
    const nodes = getDOMElementFromString('<strong>test</strong> Hello <i>world</i>');
    expect(nodes).toHaveLength(3);
    expect(nodes[0].nodeName).toBe('STRONG');
    expect(nodes[0].textContent).toEqual('test');
    expect(nodes[1].nodeName).toEqual('#text');
    expect(nodes[1].textContent).toEqual(' Hello ');
    expect(nodes[2].nodeName).toEqual('I');
    expect(nodes[2].textContent).toEqual('world');
  });
})
