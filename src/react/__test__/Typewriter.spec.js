import React, { StrictMode } from 'react';
import { render } from '@testing-library/react';
import Typewriter from './../Typewriter';
import TypewriterCore from './../../core';

jest.mock('./../../core', () => {
    return jest.fn().mockImplementation(() => ({
        stop: jest.fn()
    }));
});

describe('Typewriter component', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render correctly and create an instance of typewriter core', () => {
        const options = { strings: ['test-1', 'test-2' ]};
        const { getByTestId } = render(<Typewriter options={options}/>);

        const element = getByTestId('typewriter-wrapper');

        expect(TypewriterCore).toHaveBeenCalledTimes(1);
        expect(TypewriterCore).toHaveBeenCalledWith(element, options);
    });

    it('should call onInit prop correctly', () => {
        const options = { strings: ['test-1', 'test-2' ]};
        const onInit = jest.fn();

        render(<Typewriter options={options} onInit={onInit}/>);

        expect(onInit).toHaveBeenCalledTimes(1);
    });

    it('should call stop function correctly on unmount', () => {
        const options = { strings: ['test-1', 'test-2' ]};

        let instance = null;
        
        const { unmount } = render(<Typewriter
            options={options}
            onInit={i => instance = i}
        />);

        unmount();

        expect(instance.stop).toHaveBeenCalledTimes(1);
    });

    it('should create new typewriter instance once options prop changes', () => {
        const optionsA = { strings: ['test-1', 'test-2' ]};
        const optionsB = { strings: ['test-3', 'test-4' ]};

        const { rerender, getByTestId } = render(<Typewriter options={optionsA}/>);

        rerender(<Typewriter options={optionsB}/>);

        const element = getByTestId('typewriter-wrapper');

        expect(TypewriterCore).toHaveBeenCalledTimes(2);
        expect(TypewriterCore).toHaveBeenCalledWith(element, optionsA);
        expect(TypewriterCore).toHaveBeenCalledWith(element, optionsB);
    });

    it('should not create new typewriter instance once options prop changes and has the same content', () => {
        const optionsA = { strings: ['test-1', 'test-2' ]};
        const optionsB = { strings: ['test-1', 'test-2' ]};

        const { rerender, getByTestId } = render(<Typewriter options={optionsA}/>);

        rerender(<Typewriter options={optionsB}/>);

        const element = getByTestId('typewriter-wrapper');

        expect(TypewriterCore).toHaveBeenCalledTimes(1);
        expect(TypewriterCore).toHaveBeenCalledWith(element, optionsA);
    });

    it('should stop old instance and call onInit with new instance once options prop changes', () => {
        const optionsA = { strings: ['test-1', 'test-2' ]};
        const optionsB = { strings: ['test-3', 'test-4' ]};
        const onInit = jest.fn();

        const { rerender } = render(<Typewriter options={optionsA} onInit={onInit}/>);

        rerender(<Typewriter options={optionsB} onInit={onInit}/>);

        const firstInstance = TypewriterCore.mock.results[0].value;
        const secondInstance = TypewriterCore.mock.results[1].value;

        expect(firstInstance.stop).toHaveBeenCalledTimes(1);
        expect(onInit).toHaveBeenCalledTimes(2);
        expect(onInit).toHaveBeenLastCalledWith(secondInstance);
    });

    it('should not create new typewriter instance when only inline function options are recreated', () => {
        const { rerender } = render(<Typewriter options={{ strings: ['test-1'], stringSplitter: (text) => text.split('') }}/>);

        rerender(<Typewriter options={{ strings: ['test-1'], stringSplitter: (text) => text.split('') }}/>);

        expect(TypewriterCore).toHaveBeenCalledTimes(1);
    });

    it('should stop the first instance when strict mode mounts the component twice', () => {
        const options = { strings: ['test-1', 'test-2' ]};

        render(<StrictMode><Typewriter options={options}/></StrictMode>);

        const firstInstance = TypewriterCore.mock.results[0].value;
        const secondInstance = TypewriterCore.mock.results[1].value;

        expect(TypewriterCore).toHaveBeenCalledTimes(2);
        expect(firstInstance.stop).toHaveBeenCalledTimes(1);
        expect(secondInstance.stop).not.toHaveBeenCalled();
    });
});