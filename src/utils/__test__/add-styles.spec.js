import addStyles from '../add-styles';

describe('addStyles', () => {
  it('should add styles to document.head correctly', () => {
    const styles = '.test{color:red;}';
    let styleNode;
    document.head.appendChild = jest.fn(node => styleNode = node);
    addStyles(styles);
    expect(document.head.appendChild).toHaveBeenCalledTimes(1);
    expect(styleNode.innerHTML).toEqual(styles);
  })
})