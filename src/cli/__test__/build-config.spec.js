import { buildConfig, parseSpeed, DEFAULT_GIF_SETTINGS, DEFAULT_OPTIONS } from '../build-config';

describe('buildConfig', () => {
  it('should create steps from command line strings', () => {
    const config = buildConfig({ strings: ['Hello'] });
    expect(config.steps).toEqual([
      { name: 'typeString', args: ['Hello'] },
      { name: 'pauseFor', args: [1500] },
    ]);
  });

  it('should use the default options and gif settings', () => {
    const config = buildConfig({ strings: ['Hello'] });
    expect(config.options).toEqual(DEFAULT_OPTIONS);
    expect(config.gif).toEqual(DEFAULT_GIF_SETTINGS);
  });

  it('should let flags win over the config file', () => {
    const config = buildConfig({
      fileConfig: { options: { delay: 10, cursor: '_' }, gif: { width: 600, theme: 'light' }, steps: [{ typeString: 'Hi' }] },
      values: { delay: '50-90', width: '700', plain: true, loop: true },
    });

    expect(config.options).toMatchObject({ delay: { min: 50, max: 90 }, cursor: '_', loop: true });
    expect(config.gif).toMatchObject({ width: 700, theme: 'light', windowBar: false });
    expect(config.steps).toEqual([{ name: 'typeString', args: ['Hi'] }]);
  });

  it('should create steps from the strings in a config file', () => {
    const config = buildConfig({ fileConfig: { strings: 'Hello', options: { pauseFor: 200 } } });
    expect(config.steps).toEqual([
      { name: 'typeString', args: ['Hello'] },
      { name: 'pauseFor', args: [200] },
    ]);
  });

  it('should return no steps when there is nothing to type', () => {
    expect(buildConfig({}).steps).toEqual([]);
  });

  it('should throw for an unknown theme', () => {
    expect(() => buildConfig({ values: { theme: 'blue' }, strings: ['a'] })).toThrow('--theme must be one of: dark, light');
  });

  it('should throw for a flag that is not a number', () => {
    expect(() => buildConfig({ values: { width: 'wide' }, strings: ['a'] })).toThrow('--width must be a number');
  });
});

describe('parseSpeed', () => {
  it('should read natural, numbers and ranges', () => {
    expect(parseSpeed('natural', '--delay')).toEqual('natural');
    expect(parseSpeed('50', '--delay')).toEqual(50);
    expect(parseSpeed('20-40', '--delay')).toEqual({ min: 20, max: 40 });
  });
});
