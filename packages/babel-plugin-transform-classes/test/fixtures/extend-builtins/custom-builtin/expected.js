let Foo =
/*#__PURE__*/
function (_Bar) {
  babelHelpers.inherits(Foo, _Bar);

  function Foo() {
    babelHelpers.classCallCheck(this, Foo);
    return babelHelpers.possibleConstructorReturn(this, babelHelpers.constructSuperInstance(Foo, [...arguments], this));
  }

  return Foo;
}(babelHelpers.wrapNativeSuper(Bar));
