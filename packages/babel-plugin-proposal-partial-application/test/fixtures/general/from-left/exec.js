"use strict";

function add(x, y) { return x + y; }
const addOne = add(1, ?);

expect(addOne(2)).toBe(3);
