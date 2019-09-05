import _includesInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/includes";
import _findInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/find";
var arrayInstance = [];
var inclidesStr = "includes";
var findStr = "find"; // Allow instance methods be assigned to variables.

_includesInstanceProperty(arrayInstance).call(arrayInstance); // include


_findInstanceProperty(externalVar); // include
