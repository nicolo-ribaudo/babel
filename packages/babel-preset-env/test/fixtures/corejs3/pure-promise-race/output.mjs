import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";

var p = _Promise.resolve(0);

_Promise.race([p]).then(function (outcome) {
  alert("OK");
});
