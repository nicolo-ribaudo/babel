var _initClass, _decorated_class, _class, _temp, _ref;

const expectedValue = 42;

function decorator(target) {
  target.decoratorValue = expectedValue;
}

const result = (_ref = expectedValue, ((_temp = _class = class {
  constructor() {
    this.value = _ref;
  }

}, (() => {
  [_decorated_class, _initClass] = babelHelpers.applyDecs(_class, [], [decorator]);
})(), (() => {
  _initClass();
})(), _temp), _decorated_class));
expect(result.decoratorValue).toBe(expectedValue);
expect(new result().value).toBe(expectedValue);
