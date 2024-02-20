var _initProto, _initClass;
const dec = () => {};
let _Foo;
class Foo {
  static {
    ({
      e: [_initProto],
      c: [_Foo, _initClass]
    } = babelHelpers.applyDecs2203R(this, [[[dec, call(), chain.expr(), arbitrary + expr, array[expr]], 2, "method"]], [dec, call(), chain.expr(), arbitrary + expr, array[expr]]));
  }
  #a = void _initProto(this);
  method() {}
  makeClass() {
    var _init_bar;
    return class Nested {
      static {
        [_init_bar] = babelHelpers.applyDecs2203R(this, [[this.#a, 0, "bar"]], []).e;
      }
      bar = _init_bar(this);
    };
  }
  static {
    _initClass();
  }
}
