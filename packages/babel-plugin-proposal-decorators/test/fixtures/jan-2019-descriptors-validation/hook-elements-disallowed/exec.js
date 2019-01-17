function pushElement(e) {
  return function (c) { c.elements.push(e); return c };
}

expect(() => {
  @pushElement({
    kind: "hook",
    placement: "own",
    initializer() {},
    elements: []
  })
  class A {}
}).toThrow(TypeError);
