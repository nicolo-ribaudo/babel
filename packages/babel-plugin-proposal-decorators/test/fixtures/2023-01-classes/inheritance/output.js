var _initClass, _initClass2;
const dec = () => {};
let _Bar;
class Bar {
  static {
    [_Bar, _initClass] = babelHelpers.applyDecs2301(this, [], [dec1]).c;
  }
  static {
    _initClass();
  }
}
let _Foo;
class Foo extends _Bar {
  static {
    [_Foo, _initClass2] = babelHelpers.applyDecs2301(this, [], [dec2]).c;
  }
  static {
    _initClass2();
  }
}
