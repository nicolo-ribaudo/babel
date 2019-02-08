class Collator {
  constructor() {
    this.compare = (() => {
      const _receiver = this;
      const _func = this.compare;
      return (_argPlaceholder, _argPlaceholder2) => _func.call(_receiver, _argPlaceholder, _argPlaceholder2);
    })();
  }

  compare(a, b) {
    if (a > b) {
      return a;
    }

    ;
  }

}
