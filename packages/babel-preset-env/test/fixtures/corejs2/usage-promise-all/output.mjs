import "core-js/modules/es6.object.to-string";
import "core-js/modules/es6.promise";
import "core-js/modules/es6.string.iterator";
import "core-js/modules/es6.array.iterator";
import "core-js/modules/web.dom.iterable";
var p = Promise.resolve(0);
Promise.all([p]).then(function (outcome) {
  alert("OK");
});
