import { runCli } from '../run-cli';
import { createGif } from '../gif/create-gif';
import packageJson from '../../../package.json';

jest.mock('../gif/create-gif', () => ({
  createGif: jest.fn(() => Promise.resolve()),
}));

const createOutput = () => {
  const output = { text: '', isTTY: false, write: jest.fn(text => { output.text += text; }) };
  return output;
};

const run = async (argv) => {
  const stdout = createOutput();
  const stderr = createOutput();
  await runCli(argv, { stdout, stderr });
  return { stdout: stdout.text, stderr: stderr.text };
};

describe('runCli', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should show the help when there is nothing to type', async () => {
    expect((await run([])).stdout).toContain('Usage: typewriter-effect');
  });

  it('should show the version', async () => {
    expect((await run(['--version'])).stdout).toEqual(`${packageJson.version}\n`);
  });

  it('should print the final text when the output is not a terminal', async () => {
    expect((await run(['Hello', 'World'])).stdout).toEqual('World\n');
  });

  it('should print the final text of the demo', async () => {
    expect((await run(['--demo'])).stdout).toEqual('typewriter-effect\n');
  });

  it('should create a GIF with the config and flags', async () => {
    const { stdout } = await run(['Hello', '--gif', 'out.gif', '--theme', 'light', '--chrome', '/chrome']);

    expect(createGif).toHaveBeenCalledTimes(1);

    const [config, settings] = createGif.mock.calls[0];

    expect(config.gif.theme).toEqual('light');
    expect(config.steps[0]).toEqual({ name: 'typeString', args: ['Hello'] });
    expect(settings).toMatchObject({ output: 'out.gif', chromePath: '/chrome' });
    expect(stdout).toEqual('Saved out.gif\n');
  });

  it('should throw a clear error when the config file does not exist', async () => {
    await expect(run(['--config', 'missing.json'])).rejects.toThrow('Could not find the config file: missing.json');
  });
});
