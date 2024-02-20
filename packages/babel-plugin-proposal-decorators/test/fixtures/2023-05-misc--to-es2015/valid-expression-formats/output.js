var _initProto, _initClass, _obj, _Foo2;
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
    }, [_init_bar] = babelHelpers.applyDecs2305(_Nested, [[babelHelpers.classPrivateFieldGet2(_Nested, _a), 0, "bar"]], []).e, _Nested;
  }
}
_Foo2 = Foo;
({
  e: [_initProto],
  c: [_Foo, _initClass]
} = babelHelpers.applyDecs2305(_Foo2, [[[void 0, dec, void 0, call(), void 0, chain.expr(), void 0, arbitrary + expr, _obj = array, _obj[expr]], 18, "method"]], [void 0, dec, void 0, call(), void 0, chain.expr(), void 0, arbitrary + expr, _obj = array, _obj[expr]], 1));
_initClass();
