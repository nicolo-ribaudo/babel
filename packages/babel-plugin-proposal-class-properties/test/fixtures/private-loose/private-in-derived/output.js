var _outer = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("outer");
var Outer = /*#__PURE__*/babelHelpers.createClass(function Outer() {
  "use strict";

  babelHelpers.classCallCheck(this, Outer);
  Object.defineProperty(this, _outer, {
    writable: true,
    value: void 0
  });
  var Test = /*#__PURE__*/function (_babelHelpers$classPr) {
    babelHelpers.inherits(Test, _babelHelpers$classPr);
    var _super = babelHelpers.createSuper(Test);
    function Test() {
      babelHelpers.classCallCheck(this, Test);
      return _super.apply(this, arguments);
    }

    return babelHelpers.createClass(Test);
  }(babelHelpers.classPrivateFieldLooseBase(this, _outer)[_outer]);
});
