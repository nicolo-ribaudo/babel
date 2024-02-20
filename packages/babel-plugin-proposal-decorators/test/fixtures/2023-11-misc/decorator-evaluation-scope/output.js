let receivedName;
function decFactory(name) {
  receivedName = name;
  return x => x;
}
class B {
  static m() {
    var _init_p, _init_extra_p;
    class C {
      static #_ = [_init_p, _init_extra_p] = babelHelpers.applyDecs2311(this, [], [[decFactory(this.name), 0, "p"]]).e;
      constructor() {
        _init_extra_p(this);
      }
      p = _init_p(this);
    }
  }
}
B.m();
expect(receivedName).toBe("B");
