var _x = babelHelpers.temporalUndefined,
    _self = babelHelpers.temporalUndefined;

class Foo {
  static getSelf() {
    return this;
  }

  static test() {
    var _deep$very$o, _deep$very$o2, _deep$very$o3, _ref, _ref2, _self2, _babelHelpers$classCh, _ref3, _ref4, _getSelf, _ref5, _ref6, _babelHelpers$classCh2, _call, _getSelf2, _getSelf3, _fnDeep$very$o, _fnDeep$very$o2, _fnDeep$very$o3, _ref7, _ref8, _self3, _babelHelpers$classCh3, _ref9, _ref10, _getSelf4, _ref11, _ref12, _babelHelpers$classCh4, _call2, _getSelf5, _getSelf6;

    const o = {
      Foo: Foo
    };
    const deep = {
      very: {
        o
      }
    };

    function fn() {
      return o;
    }

    function fnDeep() {
      return deep;
    }

    o === null || o === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(o.Foo, Foo, _x);
    o === null || o === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(o.Foo, Foo, _x).toString;
    o === null || o === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(o.Foo, Foo, _x).toString();
    (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_deep$very$o.Foo, Foo, _x);
    (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_deep$very$o2.Foo, Foo, _x).toString;
    (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_deep$very$o3.Foo, Foo, _x).toString();
    o === null || o === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(babelHelpers.classCheckPrivateStaticAccess(o.Foo, Foo, _self), Foo, _x);
    o === null || o === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(babelHelpers.classCheckPrivateStaticAccess(o.Foo, Foo, _self).self, Foo, _x);
    (_ref = o === null || o === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(o.Foo, Foo, _self)) === null || _ref === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_ref.self, Foo, _x);
    (_ref2 = o === null || o === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(o.Foo, Foo, _self).self) === null || _ref2 === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_ref2.self, Foo, _x);
    (_self2 = (o === null || o === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(o.Foo, Foo, _self))?.self) === null || _self2 === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_self2.self, Foo, _x);
    o === null || o === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(babelHelpers.classCheckPrivateStaticAccess(o.Foo, Foo, _self).getSelf(), Foo, _x);
    (_ref3 = o === null || o === void 0 ? void 0 : (_babelHelpers$classCh = babelHelpers.classCheckPrivateStaticAccess(o.Foo, Foo, _self)).getSelf) === null || _ref3 === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_ref3.call(_babelHelpers$classCh), Foo, _x);
    (_ref4 = o === null || o === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(o.Foo, Foo, _self)) === null || _ref4 === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_ref4.getSelf(), Foo, _x);
    (_getSelf = (_ref5 = o === null || o === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(o.Foo, Foo, _self))?.getSelf) === null || _getSelf === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_getSelf.call(_ref5), Foo, _x);
    (_ref6 = o === null || o === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(o.Foo, Foo, _self).getSelf()) === null || _ref6 === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_ref6.self, Foo, _x);
    (_call = (o === null || o === void 0 ? void 0 : (_babelHelpers$classCh2 = babelHelpers.classCheckPrivateStaticAccess(o.Foo, Foo, _self)).getSelf)?.call(_babelHelpers$classCh2)) === null || _call === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_call.self, Foo, _x);
    (_getSelf2 = (o === null || o === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(o.Foo, Foo, _self))?.getSelf()) === null || _getSelf2 === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_getSelf2.self, Foo, _x);
    (_getSelf3 = (o === null || o === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(o.Foo, Foo, _self))?.getSelf?.()) === null || _getSelf3 === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_getSelf3.self, Foo, _x);
    fn === null || fn === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(fn().Foo, Foo, _x);
    fn === null || fn === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(fn().Foo, Foo, _x).toString;
    fn === null || fn === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(fn().Foo, Foo, _x).toString();
    (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_fnDeep$very$o.Foo, Foo, _x);
    (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_fnDeep$very$o2.Foo, Foo, _x).toString;
    (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_fnDeep$very$o3.Foo, Foo, _x).toString();
    fn === null || fn === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(babelHelpers.classCheckPrivateStaticAccess(fn().Foo, Foo, _self), Foo, _x);
    fn === null || fn === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(babelHelpers.classCheckPrivateStaticAccess(fn().Foo, Foo, _self).self, Foo, _x);
    (_ref7 = fn === null || fn === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(fn().Foo, Foo, _self)) === null || _ref7 === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_ref7.self, Foo, _x);
    (_ref8 = fn === null || fn === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(fn().Foo, Foo, _self).self) === null || _ref8 === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_ref8.self, Foo, _x);
    (_self3 = (fn === null || fn === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(fn().Foo, Foo, _self))?.self) === null || _self3 === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_self3.self, Foo, _x);
    fn === null || fn === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(babelHelpers.classCheckPrivateStaticAccess(fn().Foo, Foo, _self).getSelf(), Foo, _x);
    (_ref9 = fn === null || fn === void 0 ? void 0 : (_babelHelpers$classCh3 = babelHelpers.classCheckPrivateStaticAccess(fn().Foo, Foo, _self)).getSelf) === null || _ref9 === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_ref9.call(_babelHelpers$classCh3), Foo, _x);
    (_ref10 = fn === null || fn === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(fn().Foo, Foo, _self)) === null || _ref10 === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_ref10.getSelf(), Foo, _x);
    (_getSelf4 = (_ref11 = fn === null || fn === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(fn().Foo, Foo, _self))?.getSelf) === null || _getSelf4 === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_getSelf4.call(_ref11), Foo, _x);
    (_ref12 = fn === null || fn === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(fn().Foo, Foo, _self).getSelf()) === null || _ref12 === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_ref12.self, Foo, _x);
    (_call2 = (fn === null || fn === void 0 ? void 0 : (_babelHelpers$classCh4 = babelHelpers.classCheckPrivateStaticAccess(fn().Foo, Foo, _self)).getSelf)?.call(_babelHelpers$classCh4)) === null || _call2 === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_call2.self, Foo, _x);
    (_getSelf5 = (fn === null || fn === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(fn().Foo, Foo, _self))?.getSelf()) === null || _getSelf5 === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_getSelf5.self, Foo, _x);
    (_getSelf6 = (fn === null || fn === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(fn().Foo, Foo, _self))?.getSelf?.()) === null || _getSelf6 === void 0 ? void 0 : babelHelpers.classCheckPrivateStaticAccess(_getSelf6.self, Foo, _x);
  }

}

_x = 1;
_self = Foo;
babelHelpers.defineProperty(Foo, "self", Foo);
Foo.test();
