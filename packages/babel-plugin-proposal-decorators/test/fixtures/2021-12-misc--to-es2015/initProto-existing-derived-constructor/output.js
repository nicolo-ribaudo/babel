var _initProto, _A;
const dec = () => {};
class A extends B {
  constructor() {
    let a = 2;
    _initProto(super(a));
    foo();
  }
  method() {}
}
_A = A;
[_initProto] = babelHelpers.applyDecs(_A, [[deco, 2, "method"]], []);
