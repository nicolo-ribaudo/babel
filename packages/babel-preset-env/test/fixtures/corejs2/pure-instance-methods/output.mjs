import _Array$from from "@babel/runtime-corejs2/core-js/array/from";
import _Map from "@babel/runtime-corejs2/core-js/map";
_Array$from; // static function

_Map; // top level built-in
// instance methods may have false positives (which is ok)

a.includes(); // method call

b['find']; // computed string?

Array.prototype.findIndex(); // .prototype

d.fill.bind(); //.bind

e.padStart.apply(); // .apply

f.padEnd.call(); // .call

String.prototype.startsWith.call; // prototype.call

var _k = k,
    codePointAt = _k.codePointAt,
    endsWith = _k.endsWith; // destructuring

var asdf = "copyWithin";
var asdf2 = "split";
var asdf3 = "re" + "place";
i[asdf]; // computed with identifier

j["search"]; // computed with template

k[asdf3]; // computed with concat strings

var _k2 = k,
    _a = _k2[asdf2]; // computed
