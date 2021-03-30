class A extends B {
  constructor() {
    if (a) super(1, 2, 3);
    if (b) super(1, ...foo, 3);
    if (c) super(4, 5, 6);
    if (d) super(14, ...foo, 6);
  }
}
