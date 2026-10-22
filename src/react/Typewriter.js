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

  render() {
    const { component: Component } = this.props;

    return (
      <Component
        ref={(ref) => this.typewriter = ref}
        className='Typewriter'
        data-testid='typewriter-wrapper'
      />
    );
  }
}

Typewriter.defaultProps = {
  component: 'div'
}

export default Typewriter;
