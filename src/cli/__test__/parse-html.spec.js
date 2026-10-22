import { parseHTML, decodeEntities } from '../terminal/parse-html';
import { PALETTES } from '../colors';

const getText = (characters) => characters.map(item => item.character).join('');

describe('parseHTML', () => {
  it('should keep plain text', () => {
    expect(getText(parseHTML('Hello'))).toEqual('Hello');
  });

  it('should style bold, italic and underlined text', () => {
    const characters = parseHTML('<b>a</b><em>b</em><u>c</u>d');
    expect(characters.map(item => item.style)).toEqual([
      { bold: true },
      { italic: true },
      { underline: true },
      {},
    ]);
  });

  it('should keep styles of parent tags', () => {
    const [character] = parseHTML('<strong><i>a</i></strong>');
    expect(character.style).toEqual({ bold: true, italic: true });
  });

  it('should read colors from palette classes and style attributes', () => {
    const characters = parseHTML('<span class="green">a</span><span style="color: #ff0000">b</span><span style="color: blue">c</span>');
    expect(characters.map(item => item.style.color)).toEqual([PALETTES.dark.green, '#ff0000', PALETTES.dark.blue]);
  });

  it('should turn br tags into new lines', () => {
    expect(getText(parseHTML('a<br>b<br/>c'))).toEqual('a\nb\nc');
  });

  it('should decode entities and keep < characters that are not tags', () => {
    expect(getText(parseHTML('1 < 2 &amp; 3 &gt; 2'))).toEqual('1 < 2 & 3 > 2');
  });

  it('should keep emojis as one character', () => {
    expect(parseHTML('👋🎉').map(item => item.character)).toEqual(['👋', '🎉']);
  });

  it('should show tags as text when parseHTML is false', () => {
    expect(getText(parseHTML('<b>a</b>', { parseHTML: false }))).toEqual('<b>a</b>');
  });

  it('should ignore closing tags without an opening tag', () => {
    expect(getText(parseHTML('a</b>b'))).toEqual('ab');
  });
});

describe('decodeEntities', () => {
  it('should decode named and number entities', () => {
    expect(decodeEntities('&lt;&#65;&#x42;&nbsp;&unknown;')).toEqual('<AB &unknown;');
  });
});
