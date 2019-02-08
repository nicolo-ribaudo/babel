const slice = (() => {
  const _receiver = Array.prototype.slice;
  const _func = Array.prototype.slice.call;
  return (_argPlaceholder, _argPlaceholder2, _argPlaceholder3) => _func.call(_receiver, _argPlaceholder, _argPlaceholder2, _argPlaceholder3);
})();
