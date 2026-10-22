import cancelFrame from '../cancel-frame';

describe('cancelFrame', () => {
  it('should cancel the animation frame with the browser', () => {
    const spy = jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    cancelFrame(7);
    expect(spy).toHaveBeenCalledWith(7);

    spy.mockRestore();
  });
});
