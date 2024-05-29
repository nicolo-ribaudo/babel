import { declare } from "@babel/helper-plugin-utils";
import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";

/**
 * Given a bigIntLiteral or NumericLiteral, remove numeric
 * separator `_` from its raw representation
 *
 * @param {NodePath<BigIntLiteral | NumericLiteral>} { node }: A Babel AST node path
 */
function remover({ node }: NodePath<t.BigIntLiteral | t.NumericLiteral>) {
  const { extra } = node;
  // @ts-expect-error todo(flow->ts) 015
  if (extra?.raw?.includes("_")) {
    // @ts-expect-error todo(flow->ts) 015
    extra.raw = extra.raw.replace(/_/g, "");
  }
}

export default declare(api => {
  api.assertVersion(REQUIRED_VERSION(7));

  return {
    name: "transform-numeric-separator",
    inherits:
      USE_ESM || IS_STANDALONE || api.version[0] === "8"
        ? undefined
        : // eslint-disable-next-line no-restricted-globals
          require("@babel/plugin-syntax-numeric-separator").default,

    visitor: {
      NumericLiteral: remover,
      BigIntLiteral: remover,
    },
  };
});
