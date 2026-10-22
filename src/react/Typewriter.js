import React, { Component } from 'react';
import TypewriterCore from './../core';
import { areOptionsEqual } from './../utils';

class Typewriter extends Component {
  instance = null;

  componentDidMount() {
    this.createInstance();
  }

  componentDidUpdate(prevProps) {
    if(!areOptionsEqual(this.props.options, prevProps.options)) {
      this.stopInstance();
      this.createInstance();
    }
  }

  componentWillUnmount() {
    this.stopInstance();
  }

  createInstance() {
    this.instance = new TypewriterCore(this.typewriter, this.props.options);

    const { onInit } = this.props;

    if(onInit) {
      onInit(this.instance);
    }
  }

  stopInstance() {
    if(this.instance) {
      this.instance.stop();
      this.instance = null;
    }
  }

  /**
   * Get the class name for the element, adding the className prop when it is set
   *
   * @return {String}
   */
  getClassName() {
    const { className } = this.props;

    if(className) {
      return `Typewriter ${className}`;
    }

    return 'Typewriter';
  }

  /**
   * Get the props to pass to the element, such as data attributes or aria labels
   *
   * @return {Object}
   */
  getElementProps() {
    const {
      component,
      options,
      onInit,
      children,
      className,
      ...elementProps
    } = this.props;

    return elementProps;
  }

  render() {
    const { component: Component } = this.props;

    return (
      <Component
        data-testid='typewriter-wrapper'
        {...this.getElementProps()}
        ref={(ref) => this.typewriter = ref}
        className={this.getClassName()}
      />
    );
  }
}

Typewriter.defaultProps = {
  component: 'div'
}

export default Typewriter;
