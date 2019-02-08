"use strict";

const foo = (() => {
  const _func = bar;
  const _param = 1;
  return _argPlaceholder => _func(_param, _argPlaceholder);
})();
