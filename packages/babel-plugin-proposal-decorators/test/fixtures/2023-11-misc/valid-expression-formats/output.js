var _initProto, _initClass, _obj;
const dec = () => {};
let _Foo;
class Foo {
  static {
    ({
      e: [_initProto],
      c: [_Foo, _initClass]
    } = babelHelpers.applyDecs2311(this, [void 0, dec, void 0, call(), void 0, chain.expr(), void 0, arbitrary + expr, _obj = array, _obj[expr]], [[[void 0, dec, void 0, call(), void 0, chain.expr(), void 0, arbitrary + expr, _obj = array, _obj[expr]], 18, "method"]], 1));
  }
  #a = void _initProto(this);
  method() {}
  makeClass() {
    var _init_bar, _init_extra_bar, _classDecs, _barDecs;
    return _classDecs = [], _barDecs = [this, this.#a], class Nested {
      static {
        [_init_bar, _init_extra_bar] = babelHelpers.applyDecs2311(this, _classDecs, [[_barDecs, 16, "bar"]]).e;
      }
      constructor() {
        _init_extra_bar(this);
      }
      bar = _init_bar(this);
    };
  }
  static {
    _initClass();
  }
}
