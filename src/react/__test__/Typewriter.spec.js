import React from 'react';
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
});