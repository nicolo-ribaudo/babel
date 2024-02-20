var _initProto, _initClass, _init_b, _init_extra_b, _init_c, _get_c, _set_c, _init_extra_c, _call_d, _classDecs, _aDecs;
var log = [];
function push(x) {
  log.push(x);
  return x;
}
function logClassDecoratorRun(a, b, c) {
  push(a);
  return function (el, {
    addInitializer
  }) {
    push(b);
    addInitializer(function () {
      push(c);
    });
    return el;
  };
}
function logAccessorDecoratorRun(a, b, c, d) {
  push(a);
  return function (el, {
    addInitializer
  }) {
    push(b);
    addInitializer(function () {
      push(c);
    });
    return {
      init: () => push(d)
    };
  };
}
function logMethodDecoratorRun(a, b, c, d) {
  push(a);
  return function (el, {
    addInitializer
  }) {
    push(b);
    addInitializer(function () {
      push(c);
    });
    return () => (el(), push(d));
  };
}
_classDecs = [logClassDecoratorRun(0, 19, 29), logClassDecoratorRun(1, 18, 28)];
_aDecs = [logMethodDecoratorRun(2, 15, 31, 35), logMethodDecoratorRun(3, 14, 30, 34)];
let _A;
new class extends babelHelpers.identity {
  static {
    class A {
      static {
        ({
          e: [_init_b, _init_extra_b, _init_c, _get_c, _set_c, _init_extra_c, _call_d, _initProto],
          c: [_A, _initClass]
        } = babelHelpers.applyDecs2311(this, _classDecs, [[[logAccessorDecoratorRun(4, 11, 23, 20), logAccessorDecoratorRun(5, 10, 22, 21)], 9, "b"], [[logAccessorDecoratorRun(6, 13, 27, 24), logAccessorDecoratorRun(7, 12, 26, 25)], 9, "c", o => o.#B, (o, v) => o.#B = v], [_aDecs, 2, "a"], [[logMethodDecoratorRun(8, 17, 33, 37), logMethodDecoratorRun(9, 16, 32, 36)], 2, "d", function () {}]], 0, _ => #d in _));
      }
      #d = _call_d;
      a() {}
      static get b() {
        return A.#A;
      }
      static set b(v) {
        A.#A = v;
      }
      constructor() {
        _initProto(this);
        this.a();
        this.#d();
      }
    }
  }
  #A = _init_b(this);
  #B = (_init_extra_b(this), _init_c(this));
  set #c(v) {
    _set_c(this, v);
  }
  get #c() {
    return _get_c(this);
  }
  constructor() {
    super(_A), (() => {
      _init_extra_c(this);
    })(), _initClass();
  }
}();
var nums = Array.from({
  length: 30
}, (_, i) => i);
expect(log).toEqual(nums);
new _A();
var nums = Array.from({
  length: 38
}, (_, i) => i);
expect(log).toEqual(nums);
