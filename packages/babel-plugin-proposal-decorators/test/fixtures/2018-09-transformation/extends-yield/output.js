function* g() {
  let A = babelHelpers.decorate([dec], function (_initialize, _yield$B) {
    "use strict";

    class A extends _yield$B {
      constructor(...args) {
        super(...args);
        _initialize(this);
      }
    }

    return {
      F: A,
      d: []
    };
  }, yield B);
}
