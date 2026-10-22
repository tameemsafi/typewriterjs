import React, { StrictMode } from 'react';
import { render } from '@testing-library/react';
import Typewriter from './../Typewriter';
import TypewriterEntry from './../index';
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

    it('should add the className prop after the default class name', () => {
        const { getByTestId } = render(<Typewriter className='hero-title'/>);

        expect(getByTestId('typewriter-wrapper').className).toEqual('Typewriter hero-title');
    });

    it('should pass other props such as data and aria attributes to the element', () => {
        const { getByTestId } = render(
            <Typewriter
                component='span'
                id='hero'
                translate='no'
                aria-label='Hello World'
                data-scroll='true'
                options={{ strings: ['test-1'] }}
                onInit={jest.fn()}
            />
        );

        const element = getByTestId('typewriter-wrapper');

        expect(element.tagName).toEqual('SPAN');
        expect(element.id).toEqual('hero');
        expect(element.getAttribute('translate')).toEqual('no');
        expect(element.getAttribute('aria-label')).toEqual('Hello World');
        expect(element.getAttribute('data-scroll')).toEqual('true');
        expect(element.hasAttribute('options')).toEqual(false);
        expect(element.hasAttribute('oninit')).toEqual(false);
    });

    it('should not render children inside the element', () => {
        const { getByTestId } = render(<Typewriter>Hello</Typewriter>);

        expect(getByTestId('typewriter-wrapper').textContent).toEqual('');
    });

    it('should export the core typewriter class as TypewriterClass', () => {
        expect(TypewriterEntry).toBe(Typewriter);
        expect(TypewriterEntry.TypewriterClass).toBe(TypewriterCore);
    });
});
