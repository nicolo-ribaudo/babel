import _Array$from from "../../core-js/array/from";
import _isIterable from "../../core-js/is-iterable";
import _Symbol from "../../core-js/symbol";
export default function _iterableToArray(iter) {
  if (typeof _Symbol !== "undefined" && _isIterable(Object(iter)) || Object.prototype.toString.call(iter) === "[object Arguments]") return _Array$from(iter);
}