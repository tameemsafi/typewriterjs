import { createPage, escapeHtml, toScriptJson } from '../gif/create-page';
import { DEFAULT_GIF_SETTINGS } from '../build-config';
import { readSteps } from '../steps';

const readPageConfig = (html) => {
  const match = /<script type="application\/json" id="typewriter-config">(.*?)<\/script>/s.exec(html);
  return JSON.parse(match[1]);
};

const createTestPage = (overrides = {}) => {
  return createPage({
    coreScript: 'window.Typewriter = function() {};',
    steps: readSteps([{ typeString: 'Hello' }]),
    options: {},
    gif: DEFAULT_GIF_SETTINGS,
    ...overrides,
  });
};

describe('createPage', () => {
  it('should add the steps and options to the page', () => {
    const config = readPageConfig(createTestPage());
    expect(config.steps).toEqual([{ name: 'typeString', args: ['Hello'] }]);
    expect(config.options).toEqual({ loop: false, reserveSpace: true, devMode: false });
    expect(config.methods).toContain('moveCursor');
  });

  it('should add a delete step at the end when looping so the GIF loops smoothly', () => {
    const config = readPageConfig(createTestPage({ options: { loop: true } }));
    expect(config.steps[config.steps.length - 1]).toEqual({ name: 'deleteAllWithDeleteSpeed', args: [] });
    expect(config.options.loop).toEqual(false);
  });

  it('should not let step text close the script tag', () => {
    const html = createTestPage({ steps: readSteps([{ typeString: '</script><script>alert(1)</script>' }]) });
    expect(html).not.toContain('</script><script>alert(1)');
    expect(readPageConfig(html).steps[0].args[0]).toEqual('</script><script>alert(1)</script>');
  });

  it('should escape the title and hide the window bar when asked', () => {
    expect(createTestPage({ gif: { ...DEFAULT_GIF_SETTINGS, title: '<b>app</b>' } })).toContain('&lt;b&gt;app&lt;/b&gt;');
    expect(createTestPage({ gif: { ...DEFAULT_GIF_SETTINGS, windowBar: false } })).not.toContain('class="bar"');
  });

  it('should only show the label area when there are label steps', () => {
    expect(createTestPage()).toContain('id="typewriter-label" hidden');
    expect(createTestPage({ steps: readSteps([{ label: 'Hi' }]) })).toContain('class="label" id="typewriter-label"');
  });

  it('should use the theme colors', () => {
    expect(createTestPage({ gif: { ...DEFAULT_GIF_SETTINGS, theme: 'light' } })).toContain('background: #ffffff');
  });
});

describe('escapeHtml and toScriptJson', () => {
  it('should escape html characters', () => {
    expect(escapeHtml('<a href="x">&</a>')).toEqual('&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;');
  });

  it('should escape < inside of JSON', () => {
    expect(toScriptJson({ a: '</script>' })).toEqual('{"a":"\\u003c/script>"}');
  });
});
