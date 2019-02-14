"use strict";

const foo = bar((() => {
  const _func = baz;
  const _param = 1;
  return _argPlaceholder => _func(_argPlaceholder, _param);
})());
