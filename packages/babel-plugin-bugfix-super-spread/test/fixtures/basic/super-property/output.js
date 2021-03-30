var _B;

class A extends (_B = B) {
  constructor() {
    var _this;

    _this = Reflect.construct(_B, [...foo], new.target);
    babelHelpers.get(babelHelpers.getPrototypeOf(A.prototype), "x", _this);
    babelHelpers.get(babelHelpers.getPrototypeOf(A.prototype), "x", _this).call(_this);
    babelHelpers.set(babelHelpers.getPrototypeOf(A.prototype), "x", 2, _this, true);
    babelHelpers.get(babelHelpers.getPrototypeOf(A.prototype), "x", _this)?.call(_this);
    return _this;
  }

}
