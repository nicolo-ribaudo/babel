import _valuesInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/values";
import _Object$assign from "@babel/runtime-corejs3/core-js-stable/object/assign";
import _entriesInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/entries";
var objectClass = Object;
var arrayInstance = [];
var assignStr = "assign";
var entriesStr = "entries";
var valuesStr = "values";
var inclidesStr = "includes";
var findStr = "find"; // Allow static methods be assigned to variables only directly in the module.

_valuesInstanceProperty(externalVar); // don't include


_Object$assign({}); // include


_entriesInstanceProperty(arrayInstance).call(arrayInstance, {}); // don't include
