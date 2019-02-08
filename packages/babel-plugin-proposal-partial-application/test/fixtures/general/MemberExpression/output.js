"use strict";

const g = (() => {
  const _receiver = o;
  const _func = o.f;
  const _param = x,
        _param2 = 1;
  return _argPlaceholder => _func.call(_receiver, _argPlaceholder, _param, _param2);
})();

const h = (() => {
  const _receiver2 = p;
  const _func2 = p.b;
  const _param3 = 1,
        _param4 = y,
        _param5 = x,
        _param6 = 2;
  return _argPlaceholder2 => _func2.call(_receiver2, _param3, _param4, _param5, _param6, _argPlaceholder2);
})();
