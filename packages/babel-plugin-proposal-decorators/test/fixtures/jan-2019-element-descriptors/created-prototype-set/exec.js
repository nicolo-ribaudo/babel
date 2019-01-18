function pushElement(e) {
  return function (c) { c.elements.push(e); return c };
}

function set() {}

@pushElement({
  kind: "accessor",
  placement: "prototype",
  key: "foo",
  enumerable: true,
  configurable: true,
  set: set,
})
class A {}


expect(A).not.toHaveProperty("foo");

expect(Object.getOwnPropertyDescriptor(A.prototype, "foo")).toEqual({
  enumerable: true,
  configurable: true,
  set: set,
});
