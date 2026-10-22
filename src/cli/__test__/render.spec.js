import { renderFrame, stylizeCharacters, stripAnsi, countRows, TerminalScreen, HIDE_CURSOR, SHOW_CURSOR } from '../terminal/render';

const plain = (text) => text.split('').map(character => ({ character, style: {} }));

describe('render', () => {
  it('should add ANSI codes once for each run of the same style', () => {
    const characters = [
      { character: 'a', style: { bold: true } },
      { character: 'b', style: { bold: true } },
      { character: 'c', style: {} },
    ];
    expect(stylizeCharacters(characters)).toEqual('\u001b[1mab\u001b[0mc');
  });

  it('should add truecolor codes for colors', () => {
    expect(stylizeCharacters([{ character: 'a', style: { color: '#ff0000' } }])).toEqual('\u001b[38;2;255;0;0ma\u001b[0m');
  });

  it('should put the cursor at the cursor index and the label above the text', () => {
    const frame = renderFrame({
      characters: plain('abc'),
      cursorIndex: 1,
      cursor: '|',
      label: plain('label'),
    });
    expect(stripAnsi(frame)).toEqual('label\n\na|bc');
  });

  it('should count wrapped rows and wide characters', () => {
    expect(countRows('abcdef', 4)).toEqual(2);
    expect(countRows('a\nb', 80)).toEqual(2);
    expect(countRows('👋👋👋', 4)).toEqual(2);
  });

  describe('TerminalScreen', () => {
    it('should clear the previous frame before drawing the next one', () => {
      const output = { columns: 80, write: jest.fn() };
      const screen = new TerminalScreen(output);

      screen.start();
      screen.draw('a\nb');
      screen.draw('c');
      screen.finish();

      expect(output.write.mock.calls.map(([text]) => text)).toEqual([
        HIDE_CURSOR,
        '\r\u001b[Ja\nb',
        '\u001b[1A\r\u001b[Jc',
        `\n${SHOW_CURSOR}`,
      ]);
    });
  });
});
