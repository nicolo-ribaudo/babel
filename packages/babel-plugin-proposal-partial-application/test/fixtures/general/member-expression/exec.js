"use strict";
const obj = { add: (x, y) => x + y };
const addOne = obj.add(1, ?);

expect(addOne(5)).toBe(6);
