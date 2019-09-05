import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";

var p = _Promise.resolve(0);

p.finally(function () {
  alert("OK");
});
