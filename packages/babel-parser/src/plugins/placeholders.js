// @flow

import * as charCodes from "charcodes";

import { types as tt, TokenType } from "../tokenizer/types";
import * as N from "../types";
import V8IntrinsicParser from "./v8intrinsic";

tt.placeholder = new TokenType("%%", { startsExpr: true });

export type PlaceholderTypes =
  | "Identifier"
  | "StringLiteral"
  | "Expression"
  | "Statement"
  | "Declaration"
  | "BlockStatement"
  | "ClassBody"
  | "Pattern";

// $PropertyType doesn't support enums. Use a fake "switch" (GetPlaceholderNode)
//type MaybePlaceholder<T: PlaceholderTypes> = $PropertyType<N, T> | N.Placeholder<T>;

type _Switch<Value, Cases, Index> = $Call<
  (
    $ElementType<$ElementType<Cases, Index>, 0>,
  ) => $ElementType<$ElementType<Cases, Index>, 1>,
  Value,
>;
type $Switch<Value, Cases> = _Switch<Value, Cases, *>;

type NodeOf<T: PlaceholderTypes> = $Switch<
  T,
  [
    ["Identifier", N.Identifier],
    ["StringLiteral", N.StringLiteral],
    ["Expression", N.Expression],
    ["Statement", N.Statement],
    ["Declaration", N.Declaration],
    ["BlockStatement", N.BlockStatement],
    ["ClassBody", N.ClassBody],
    ["Pattern", N.Pattern],
  ],
>;

// Placeholder<T> breaks everything, because its type is incompatible with
// the substituted nodes.
export type MaybePlaceholder<T: PlaceholderTypes> = NodeOf<T>; // | Placeholder<T>

export default class PlaceholdersParser extends V8IntrinsicParser {
  shouldParsePlaceholder(): boolean {
    return this.match(tt.placeholder);
  }

  parsePlaceholder<T: PlaceholderTypes>(
    expectedNode: T,
  ): /*?N.Placeholder<T>*/ MaybePlaceholder<T> {
    const node = this.startNode();
    this.next();
    this.assertNoSpace("Unexpected space in placeholder.");

    // We can't use this.parseIdentifier because
    // we don't want nested placeholders.
    node.name = super.parseIdentifier(/* liberal */ true);

    this.assertNoSpace("Unexpected space in placeholder.");
    this.expect(tt.placeholder);
    return this.finishPlaceholder(node, expectedNode);
  }

  finishPlaceholder<T: PlaceholderTypes>(
    node: N.Node,
    expectedNode: T,
  ): /*N.Placeholder<T>*/ MaybePlaceholder<T> {
    const isFinished = !!(node.expectedNode && node.type === "Placeholder");
    node.expectedNode = expectedNode;

    return isFinished ? node : this.finishNode(node, "Placeholder");
  }

  placeholderGetTokenFromCode(code: number): boolean {
    if (
      code === charCodes.percentSign &&
      this.input.charCodeAt(this.state.pos + 1) === charCodes.percentSign
    ) {
      this.finishOp(tt.placeholder, 2);
      return true;
    }

    return false;
  }

  placeholderToAssignable(node: N.Node): boolean {
    if (node.type === "Placeholder" && node.expectedNode === "Expression") {
      node.expectedNode = "Pattern";
      return true;
    }
    return false;
  }

  parseExpressionStatementFromPlaceholder(
    node: MaybePlaceholder<"Statement">,
    expr: N.Expression,
  ): MaybePlaceholder<"Statement"> {
    if (this.match(tt.colon)) {
      const stmt: N.LabeledStatement = node;
      stmt.label = this.finishPlaceholder(expr, "Identifier");
      this.next();
      stmt.body = this.parseStatement("label");
      return this.finishNode(stmt, "LabeledStatement");
    }

    this.semicolon();

    node.name = expr.name;
    return this.finishPlaceholder(node, "Statement");
  }

  parseClassWithPlaceholder<T: N.Class>(
    node: T,
    type: $PropertyType<T, "type">,
    optionalId?: boolean,
  ): ?T {
    const placeholder = this.parsePlaceholder("Identifier");

    if (
      this.match(tt._extends) ||
      this.match(tt.placeholder) ||
      this.match(tt.braceL)
    ) {
      node.id = placeholder;
      return null;
    }

    if (optionalId || type === "ClassExpression") {
      node.id = null;
      node.body = this.finishPlaceholder(placeholder, "ClassBody");
    } else {
      this.unexpected(null, "A class name is required");
    }

    return this.finishNode(node, type);
  }

  parseExportHeadWithPlaceholder(node: N.Node) {
    const placeholder = this.parsePlaceholder("Identifier");

    if (!this.isContextual("from") && !this.match(tt.comma)) {
      // export %%DECL%%;
      node.specifiers = [];
      node.source = null;
      node.declaration = this.finishPlaceholder(placeholder, "Declaration");
      return false;
    }

    this.parseExportDefaultSpecifier(node, placeholder);

    return true;
  }

  /* ============================================================ *
   * parser/statement.js                                          *
   * ============================================================ */

  parseImportWithPlaceholder(node: N.Node) {
    const placeholder = this.parsePlaceholder("Identifier");

    if (!this.isContextual("from") && !this.match(tt.comma)) {
      // import %%STRING%%;
      node.source = this.finishPlaceholder(placeholder, "StringLiteral");
      return { sourceParsed: true, hasDefault: false };
    }

    // import %%DEFAULT%% ...
    const specifier = this.startNodeAtNode(placeholder);
    specifier.local = placeholder;
    this.finishNode(specifier, "ImportDefaultSpecifier");
    node.specifiers.push(specifier);

    return { sourceParsed: false, hasDefault: true };
  }
}
