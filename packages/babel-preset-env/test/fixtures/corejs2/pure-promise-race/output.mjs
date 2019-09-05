import _Promise from "@babel/runtime-corejs2/core-js/promise";

var p = _Promise.resolve(0);

_Promise.race([p]).then(function (outcome) {
  alert("OK");
});
