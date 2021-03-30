var _B;

class A extends (_B = B) {
  constructor() {
    var _this;

    _this = Reflect.construct(_B, [1, ...foo, 2], new.target);
    _this.x;

    _B.prototype.x.call(_this);

    _this.y = 3;
    return _this;
  }

}
