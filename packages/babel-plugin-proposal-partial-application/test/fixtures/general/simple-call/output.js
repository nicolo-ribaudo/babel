"use strict";

const foo = (() => {
  const _func = bar;
  return _argPlaceholder => _func(_argPlaceholder);
})();
