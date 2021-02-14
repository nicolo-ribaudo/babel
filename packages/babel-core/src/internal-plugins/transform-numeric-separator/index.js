import { declare } from "@babel/helper-plugin-utils";

/**
 * Given a bigIntLiteral or NumericLiteral, remove numeric
 * separator `_` from its raw representation
 *
 * @param {NodePath<BigIntLiteral | NumericLiteral>} { node }: A Babel AST node path
 */
function remover({ node }: NodePath<BigIntLiteral | NumericLiteral>) {
  const { extra } = node;
  if (extra?.raw?.includes("_")) {
    extra.raw = extra.raw.replace(/_/g, "");
  }
}

export default declare(() => {
  return {
    name: "internal:transform-numeric-separator",

    visitor: {
      NumericLiteral: remover,
      BigIntLiteral: remover,
    },
  };
});
