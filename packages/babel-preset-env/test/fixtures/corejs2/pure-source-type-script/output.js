var _Promise = require("@babel/runtime-corejs2/core-js/promise");

require("foo");

var x = new _Promise(function (resolve) {
  var p = [];

  if (p.includes("a")) {}
});
