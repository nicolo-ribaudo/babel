var _B;

class A extends (_B = B) {
  constructor() {
    var _this;

    _this = Reflect.construct(_B, [1, ...foo, 2], new.target);
    return _this;
  }

}
