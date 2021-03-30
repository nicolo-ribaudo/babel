class A extends B {
  constructor() {
    super(1, ...foo, 2);
    this.x;
    super.x();
    super.y = 3;
  }
}
