export const plugins = {
  __proto__: null,
  // "transform-foo": pluginTransformFoo,
};

const aliases = {
  __proto__: null,
  // "@babel/plugin-transform-foo": "transform-foo"
};

export function internalPluginName(name: string): string | undefined {
  if (name in plugins) {
    return `internal:${name}`;
  } else if (name in aliases) {
    return `internal:${aliases[name]}`;
  }
}
