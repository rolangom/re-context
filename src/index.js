import React from 'react';
import equal from 'fast-deep-equal';

// by @rolangom 05/04/2018

function createStore(initialState) {
  const Context = React.createContext(initialState);

  class Provider extends React.Component {
    state = initialState;
    __setState = this.setState.bind(this);
    getValue = () => ({
      state: this.state,
      setState: this.__setState,
    });
    render() {
      return (
        <Context.Provider value={this.getValue()}>
          {this.props.children}
        </Context.Provider>
      );
    }
  }

  class StrictRenderer extends React.Component {
    shouldComponentUpdate(nextProps) {
      // **equal** function taken from https://github.com/epoberezkin/fast-deep-equal/blob/master/index.js
      return !equal(this.props, nextProps);
    }
    render() {
      const {
        component: Component,
        ...rest,
      } = this.props;
      return (
        <Component
          {...rest}
        />
      )
    }
  }
  const id = x => x;
  const connect = (mapStateToProps = id, mapActionsToProps = id) => (WrappedComponent) => {
    const newMapDispatchToProps = (setState, props) =>
      mapActionsToProps instanceof Function
        ? mapActionsToProps(setState, props)
        : Object.keys(mapActionsToProps).reduce(
          (obj, key) => Object.assign(obj, {
            [key]: (...args) => setState(mapActionsToProps[key].apply(null, args)), 
          }),
          {}
        );
    const ConnectComponent = (props) => (
      <Context.Consumer>
        {({ state, setState }) => (
          <StrictRenderer
            component={WrappedComponent}
            {...props}
            {...mapStateToProps(state, props)}
            {...newMapDispatchToProps(setState, props)}
          />
        )}
      </Context.Consumer>
    );
    ConnectComponent.displayName = `Connect(${WrappedComponent.displayName || WrappedComponent.name || 'Unknown'})`
    return ConnectComponent;
  };

  return {
    Provider,
    Consumer: Context.Consumer,
    connect,
  };
}
