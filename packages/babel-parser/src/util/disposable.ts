export function SymbolDispose(): typeof Symbol.dispose {
  return Symbol.dispose || (Symbol.for("Symbol.dispose") as any);
}

export abstract class ScopeLike<T> {
  abstract enter(flags: T): void;
  abstract exit(): void;

  with(flags: T): Disposable {
    this.enter(flags);
    return { [SymbolDispose()]: () => this.exit() };
  }
}
