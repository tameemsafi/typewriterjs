import requestFrame from '../request-frame';

describe('requestFrame', () => {
  it('should request an animation frame from the browser and return its id', () => {
    const callback = jest.fn();
    const spy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 7);

    expect(requestFrame(callback)).toEqual(7);
    expect(spy).toHaveBeenCalledWith(callback);

    spy.mockRestore();
  });
});
