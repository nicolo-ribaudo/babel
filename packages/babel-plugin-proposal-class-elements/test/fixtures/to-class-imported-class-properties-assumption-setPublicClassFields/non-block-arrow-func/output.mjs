export default (param => {
  var _App;

  return _App = class App {
    getParam() {
      return param;
    }

  }, babelHelpers.defineProperty(_App, "props", {
    prop1: 'prop1',
    prop2: 'prop2'
  }), _App;
});
