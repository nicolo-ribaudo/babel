import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";
import _setTimeout from "@babel/runtime-corejs3/core-js-stable/set-timeout";
import _setInterval from "@babel/runtime-corejs3/core-js-stable/set-interval";
import _setImmediate from "@babel/runtime-corejs3/core-js-stable/set-immediate";

_Promise.resolve().then(function (it) {
  _setTimeout(foo, 1, 2);

  _setInterval(foo, 1, 2);

  _setImmediate(foo, 1, 2);
});
