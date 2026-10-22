import TerminalTypewriter from '../terminal/terminal-typewriter';
import { readSteps } from '../steps';
import { stripAnsi } from '../terminal/render';

const createTypewriter = (steps, options = {}) => {
  const frames = [];
  const waits = [];
  const typewriter = new TerminalTypewriter({
    options: { delay: 10, deleteSpeed: 5, ...options },
    steps: readSteps(steps),
    draw: frame => frames.push(stripAnsi(frame)),
    wait: ms => {
      waits.push(ms);
      return Promise.resolve();
    },
  });

  return { typewriter, frames, waits };
};

describe('TerminalTypewriter', () => {
  it('should type each character with the typing delay', async () => {
    const { typewriter, frames, waits } = createTypewriter([{ typeString: 'ab' }]);
    await typewriter.play();
    expect(frames).toEqual(['|', 'a|', 'ab|']);
    expect(waits).toEqual([10, 10]);
  });

  it('should delete characters with the delete speed', async () => {
    const { typewriter, waits } = createTypewriter([{ typeString: 'abc' }, { deleteChars: 2 }]);
    await typewriter.play();
    expect(typewriter.getText()).toEqual('a');
    expect(waits.slice(3)).toEqual([5, 5]);
  });

  it('should fix a typo by moving the cursor', async () => {
    const { typewriter, frames } = createTypewriter([
      { typeString: 'Fix tpyos' },
      { moveCursor: -3 },
      { deleteChars: 1 },
      { moveCursor: 1 },
      { typeString: 'p' },
      { moveCursorToEnd: true },
      { typeString: '!' },
    ]);
    await typewriter.play();
    expect(frames[frames.length - 1]).toEqual('Fix typos!|');
  });

  it('should not move the cursor past the start or the end', async () => {
    const { typewriter, frames } = createTypewriter([{ typeString: 'ab' }, { moveCursor: -5 }]);
    await typewriter.play();
    expect(frames[frames.length - 1]).toEqual('|ab');
  });

  it('should paste text in one step', async () => {
    const { typewriter, frames, waits } = createTypewriter([{ pasteString: '<b>hello</b>' }]);
    await typewriter.play();
    expect(frames).toEqual(['|', 'hello|']);
    expect(waits).toEqual([10]);
  });

  it('should delete everything with deleteAll from the end', async () => {
    const { typewriter } = createTypewriter([{ typeString: 'abc' }, { moveCursor: -2 }, { deleteAll: 1 }]);
    await typewriter.play();
    expect(typewriter.getText()).toEqual('');
  });

  it('should clear straight away', async () => {
    const { typewriter, frames } = createTypewriter([{ typeString: 'ab' }, { clear: true }]);
    await typewriter.play();
    expect(frames[frames.length - 1]).toEqual('|');
  });

  it('should change the delay, delete speed and cursor', async () => {
    const { typewriter, frames, waits } = createTypewriter([
      { changeDelay: 30 },
      { changeDeleteSpeed: 40 },
      { changeCursor: '_' },
      { typeString: 'a' },
      { deleteChars: 1 },
    ]);
    await typewriter.play();
    expect(waits).toEqual([30, 40]);
    expect(frames[frames.length - 1]).toEqual('_');
  });

  it('should pause and show labels above the text', async () => {
    const { typewriter, frames, waits } = createTypewriter([{ label: 'step one' }, { pauseFor: 500 }]);
    await typewriter.play();
    expect(waits).toEqual([500]);
    expect(frames[frames.length - 1]).toEqual('step one\n\n|');
  });

  it('should delete everything and run the steps again when looping', async () => {
    const { typewriter, frames } = createTypewriter([{ typeString: 'a' }], { loop: true });
    let loops = 0;
    typewriter.restartLoop = jest.fn(async function() {
      loops += 1;
      if(loops === 2) {
        typewriter.stop();
      }
      await TerminalTypewriter.prototype.restartLoop.call(typewriter);
    });

    await typewriter.play();

    expect(typewriter.restartLoop).toHaveBeenCalledTimes(2);
    expect(frames).toContain('|');
    expect(typewriter.getText()).toEqual('');
  });
});
