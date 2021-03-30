class A extends B {
  constructor() {
    super(...foo);

    super.x;
    super.x();
    super.x = 2;
    super.x?.();
  }
}
