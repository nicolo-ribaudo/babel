import _Object$assign from "@babel/runtime-corejs2/core-js/object/assign";
var objectClass = Object;
var arrayInstance = [];
var assignStr = "assign";
var entriesStr = "entries";
var valuesStr = "values";
var inclidesStr = "includes";
var findStr = "find"; // Allow static methods be assigned to variables only directly in the module.

externalVar[valuesStr]; // don't include

_Object$assign({}); // include


arrayInstance[entriesStr]({}); // don't include
