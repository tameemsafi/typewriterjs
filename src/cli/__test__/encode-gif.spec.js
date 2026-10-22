import { getFfmpegArguments } from '../gif/encode-gif';
import { getFramePath } from '../gif/record-frames';

describe('encode-gif', () => {
  it('should read the frames in order and make a looping GIF', () => {
    const args = getFfmpegArguments({ framesDirectory: '/tmp/frames', fps: 25, output: '/tmp/out.gif' });

    expect(args).toContain('/tmp/frames/frame-%05d.png');
    expect(args.slice(args.indexOf('-framerate'), args.indexOf('-framerate') + 2)).toEqual(['-framerate', '25']);
    expect(args.slice(-3)).toEqual(['-loop', '0', '/tmp/out.gif']);
    expect(args.join(' ')).toContain('palettegen');
  });

  it('should name frames so ffmpeg reads them in order', () => {
    expect(getFramePath('/tmp/frames', 7)).toEqual('/tmp/frames/frame-00007.png');
  });
});
