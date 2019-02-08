"use strict";

const baz = (() => {
  const _func = ber;
  const _param = 2,
        _param2 = 4,
        _param3 = 1;
  return (_argPlaceholder, _argPlaceholder2) => _func(_param, _param2, _argPlaceholder, _argPlaceholder2, _param3);
})();

const foo = (() => {
  const _func2 = bar;
  const _param4 = 1,
        _param5 = x,
        _param6 = 3;
  return (_argPlaceholder3, _argPlaceholder4) => _func2(_param4, _argPlaceholder3, _param5, _param6, _argPlaceholder4);
})();
