var _initProto, _initClass, _Foo2;
const dec = () => {};
let _Foo;
var _a = /*#__PURE__*/new WeakMap();
class Foo {
  constructor() {
    babelHelpers.classPrivateFieldInitSpec(this, _a, void _initProto(this));
  }
  method() {}
  makeClass() {
    var _init_bar, _Nested;
    return _Nested = class Nested {
      constructor() {
        babelHelpers.defineProperty(this, "bar", _init_bar(this));
      }
    }, [_init_bar] = babelHelpers.applyDecs2203R(_Nested, [[babelHelpers.classPrivateFieldGet2(_Nested, _a), 0, "bar"]], []).e, _Nested;
  }
}
_Foo2 = Foo;
({
  e: [_initProto],
  c: [_Foo, _initClass]
} = babelHelpers.applyDecs2203R(_Foo2, [[[dec, call(), chain.expr(), arbitrary + expr, array[expr]], 2, "method"]], [dec, call(), chain.expr(), arbitrary + expr, array[expr]]));
_initClass();
