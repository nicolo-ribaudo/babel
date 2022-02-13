var _initClass, _decorated_class, _ref;

const expectedValue = 42;

function decorator(target) {
  target.decoratorValue = expectedValue;
}

const result = (_ref = expectedValue, (class {
  static {
    [_decorated_class, _initClass] = babelHelpers.applyDecs(this, [], [decorator]);
  }

  constructor() {
    this.value = _ref;
  }

  static {
    _initClass();

  }
}, _decorated_class));
expect(result.decoratorValue).toBe(expectedValue);
expect(new result().value).toBe(expectedValue);
