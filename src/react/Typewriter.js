import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TypewriterCore from './../core';

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

  componentWillUnmount() {
    if(this.state.instance) {
      this.state.instance.stop();
    }
  }

  render() {
    return (
      <div className='Typewriter' ref={(ref) => this.typewriter = ref}></div>
    );
  }
}

Typewriter.propTypes = {
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

export default Typewriter;