var _Promise = require("@babel/runtime-corejs3/core-js-stable/promise");

var _includesInstanceProperty = require("@babel/runtime-corejs3/core-js-stable/instance/includes");

require("foo");

var x = new _Promise(function (resolve) {
  var p = [];

  if (_includesInstanceProperty(p).call(p, "a")) {}
});
