var _Array$from = require("../core-js/array/from");

var _isIterable = require("../core-js/is-iterable");

var _Symbol = require("../core-js/symbol");

function _iterableToArray(iter) {
  if (typeof _Symbol !== "undefined" && _isIterable(Object(iter)) || Object.prototype.toString.call(iter) === "[object Arguments]") return _Array$from(iter);
}

module.exports = _iterableToArray;