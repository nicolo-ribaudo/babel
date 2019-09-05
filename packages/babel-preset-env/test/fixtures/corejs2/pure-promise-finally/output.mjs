import _Promise from "@babel/runtime-corejs2/core-js/promise";

var p = _Promise.resolve(0);

p.finally(function () {
  alert("OK");
});
