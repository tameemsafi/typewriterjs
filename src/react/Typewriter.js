import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TypewriterCore from './../core';
import isEqual from 'lodash/isEqual';

class Typewriter extends Component {
  state = {
    instance: null,
  };

  componentDidMount() {
    const instance = new TypewriterCore(this.typewriter, this.props.options);

    this.setState({
      instance,
    }, () => {
      const { onInit } = this.props;
      
      if(onInit) {
        onInit(instance);
      }
    });
  }

  componentDidUpdate(prevProps) {
    if(!isEqual(this.props.options, prevProps.options)) {
      this.setState({
        instance: new TypewriterCore(this.typewriter, this.props.options)
      });
    }
  }

  componentWillUnmount() {
    if(this.state.instance) {
      this.state.instance.stop();
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

Typewriter.propTypes = {
  component: PropTypes.element,
  onInit: PropTypes.func,
  options: PropTypes.objectOf(PropTypes.shape({
    strings: PropTypes.arrayOf(PropTypes.string),
    cursor: PropTypes.string,
    delay: PropTypes.number,
    loop: PropTypes.bool,
    autoStart: PropTypes.bool,
    devMode: PropTypes.bool,
    wrapperClassName: PropTypes.string,
    cursorClassName: PropTypes.string,
  })),
};

Typewriter.defaultProps = {
  component: 'div'
}

export default Typewriter;
