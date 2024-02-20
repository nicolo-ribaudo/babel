var _initProto, _initClass;
const dec = () => {};
let _Foo;
class Foo {
  static {
    [_initProto, _Foo, _initClass] = babelHelpers.applyDecs(this, [[[dec, call(), chain.expr(), arbitrary + expr, array[expr]], 2, "method"]], [dec, call(), chain.expr(), arbitrary + expr, array[expr]]);
  }
  #a = void _initProto(this);
  method() {}
  makeClass() {
    var _init_bar;
    return class Nested {
      static {
        [_init_bar] = babelHelpers.applyDecs(this, [[this.#a, 0, "bar"]], []);
      }
      bar = _init_bar(this);
    };
  }
  static {
    _initClass();
  }
}
