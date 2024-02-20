var _initProto, _initProto2;
const dec = () => {};
class A extends B {
  static {
    [_initProto] = babelHelpers.applyDecs2203R(this, [[deco, 2, "method"]], []).e;
  }
  constructor() {
    if (Math.random() > 0.5) {
      _initProto(super(true));
    } else {
      _initProto(super(false));
    }
  }
  method() {}
}
class C extends B {
  static {
    [_initProto2] = babelHelpers.applyDecs2203R(this, [[deco, 2, "method"]], []).e;
  }
  constructor() {
    try {
      _initProto2(super(_initProto2(super()), null.x));
    } catch {}
  }
  method() {}
}
