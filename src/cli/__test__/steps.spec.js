import { readStep, readSteps, createStepsFromStrings } from '../steps';

describe('steps', () => {
  it('should read a step with one argument', () => {
    expect(readStep({ typeString: 'Hello' })).toEqual({ name: 'typeString', args: ['Hello'] });
  });

  it('should read a step without arguments when the value is true', () => {
    expect(readStep({ moveCursorToEnd: true })).toEqual({ name: 'moveCursorToEnd', args: [] });
  });

  it('should read a step with several arguments from an array', () => {
    expect(readStep({ deleteAll: [20] })).toEqual({ name: 'deleteAll', args: [20] });
  });

  it('should read a label step', () => {
    expect(readStep({ label: 'Hi' })).toEqual({ name: 'label', args: ['Hi'] });
  });

  it('should throw for unknown steps', () => {
    expect(() => readStep({ start: true })).toThrow('Unknown step "start"');
  });

  it('should throw when a step has more than one key', () => {
    expect(() => readStep({ typeString: 'a', pauseFor: 1 })).toThrow('exactly one key');
  });

  it('should throw when steps is not an array', () => {
    expect(() => readSteps({})).toThrow('must be an array');
  });

  it('should create steps that keep the last string when not looping', () => {
    expect(createStepsFromStrings(['a', 'b'], { pauseFor: 100, loop: false })).toEqual([
      { typeString: 'a' },
      { pauseFor: 100 },
      { deleteAllWithDeleteSpeed: true },
      { typeString: 'b' },
      { pauseFor: 100 },
    ]);
  });

  it('should delete the last string when looping', () => {
    const steps = createStepsFromStrings(['a'], { pauseFor: 100, loop: true });
    expect(steps[steps.length - 1]).toEqual({ deleteAllWithDeleteSpeed: true });
  });
});
