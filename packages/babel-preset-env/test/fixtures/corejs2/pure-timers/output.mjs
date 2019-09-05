import _Promise from "@babel/runtime-corejs2/core-js/promise";
import _setImmediate from "@babel/runtime-corejs2/core-js/set-immediate";

_Promise.resolve().then(function (it) {
  setTimeout(foo, 1, 2);
  setInterval(foo, 1, 2);

  _setImmediate(foo, 1, 2);
});
