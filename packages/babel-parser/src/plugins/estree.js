// @flow

/* global BigInt */

import { types as tt } from "../tokenizer/types";
import * as N from "../types";
import { type BindingTypes, BIND_NONE } from "../util/scopeflags";
import JSXParser from "./jsx";

function isSimpleProperty(node: N.Node): boolean {
  return (
    node != null &&
    node.type === "Property" &&
    node.kind === "init" &&
    node.method === false
  );
}

export default class ESTreeAdapter extends JSXParser {
  estreeParseRegExpLiteral({ pattern, flags }: N.RegExpLiteral): N.Node {
    let regex = null;
    try {
      regex = new RegExp(pattern, flags);
    } catch (e) {
      // In environments that don't support these flags value will
      // be null as the regex can't be represented natively.
    }
    const node = this.estreeParseLiteral(regex);
    node.regex = { pattern, flags };

    return node;
  }

  estreeParseBigIntLiteral(value: any): N.Node {
    // https://github.com/estree/estree/blob/master/es2020.md#bigintliteral
    // $FlowIgnore
    const bigInt = typeof BigInt !== "undefined" ? BigInt(value) : null;
    const node = this.estreeParseLiteral(bigInt);
    node.bigint = String(node.value || value);

    return node;
  }

  estreeParseLiteral(value: any): N.Node {
    return this.parseLiteral(value, "Literal");
  }

  directiveToStmt(directive: N.Directive): N.ExpressionStatement {
    const directiveLiteral = directive.value;

    const stmt = this.startNodeAt(directive.start, directive.loc.start);
    const expression = this.startNodeAt(
      directiveLiteral.start,
      directiveLiteral.loc.start,
    );

    expression.value = directiveLiteral.value;
    expression.raw = directiveLiteral.extra.raw;

    stmt.expression = this.finishNodeAt(
      expression,
      "Literal",
      directiveLiteral.end,
      directiveLiteral.loc.end,
    );
    stmt.directive = directiveLiteral.extra.raw.slice(1, -1);

    return this.finishNodeAt(
      stmt,
      "ExpressionStatement",
      directive.end,
      directive.loc.end,
    );
  }

  // ==================================
  // Overrides
  // ==================================

  estreeCheckDeclaration(node: N.Pattern | N.ObjectProperty): boolean {
    if (isSimpleProperty(node)) {
      this.checkDeclaration(((node: any): N.EstreeProperty).value);
      return true;
    }
    return false;
  }

  estreeCheckGetterSetterParams(method: N.ObjectMethod | N.ClassMethod): void {
    const prop = ((method: any): N.EstreeProperty | N.EstreeMethodDefinition);
    const paramCount = prop.kind === "get" ? 0 : 1;
    const start = prop.start;
    if (prop.value.params.length !== paramCount) {
      if (prop.kind === "get") {
        this.raise(start, "getter must not have any formal parameters");
      } else {
        this.raise(start, "setter must have exactly one formal parameter");
      }
    } else if (
      prop.kind === "set" &&
      prop.value.params[0].type === "RestElement"
    ) {
      this.raise(
        start,
        "setter function argument must not be a rest parameter",
      );
    }
  }

  estreeCheckLVal(
    expr: N.Expression,
    bindingType: BindingTypes = BIND_NONE,
    checkClashes: ?{ [key: string]: boolean },
    contextDescription: string,
    disallowLetBinding?: boolean,
  ): boolean {
    if (expr.type === "ObjectPattern") {
      expr.properties.forEach(prop => {
        this.checkLVal(
          prop.type === "Property" ? prop.value : prop,
          bindingType,
          checkClashes,
          "object destructuring pattern",
          disallowLetBinding,
        );
      });
      return true;
    }
    return false;
  }

  estreeIsStrictBody(node: { body: N.BlockStatement }): boolean {
    if (node.body.body.length > 0) {
      for (const directive of node.body.body) {
        // Break for the first non literal expression
        if (!this.isValidDirective(directive)) break;

        if (directive.expression.value === "use strict") return true;
      }
    }

    return false;
  }

  estreeIsValidDirective(stmt: N.Statement): boolean {
    return (
      stmt.type === "ExpressionStatement" &&
      stmt.expression.type === "Literal" &&
      typeof stmt.expression.value === "string" &&
      (!stmt.expression.extra || !stmt.expression.extra.parenthesized)
    );
  }

  estreeParseExprAtom(): ?N.Expression {
    switch (this.state.type) {
      case tt.num:
      case tt.string:
        return this.estreeParseLiteral(this.state.value);

      case tt.regexp:
        return this.estreeParseRegExpLiteral(this.state.value);

      case tt.bigint:
        return this.estreeParseBigIntLiteral(this.state.value);

      case tt._null:
        return this.estreeParseLiteral(null);

      case tt._true:
        return this.estreeParseLiteral(true);

      case tt._false:
        return this.estreeParseLiteral(false);
    }
  }

  estreeMethodToFunction<T: N.MethodLike>(node: T, type: string): T {
    (node: any).type = "FunctionExpression";
    delete node.kind;

    const wrapperNode = this.startNodeAtNode(node);
    wrapperNode.value = node;
    wrapperNode.key = (node: any).key;

    return this.finishNode(
      wrapperNode,
      type === "ClassMethod" ? "MethodDefinition" : type,
    );
  }

  estreeToAssignable(
    node: N.Node,
    isBinding: ?boolean,
    contextDescription: string,
  ): boolean {
    if (isSimpleProperty(node)) {
      this.toAssignable(node.value, isBinding, contextDescription);
      return true;
    }

    return false;
  }

  estreeToAssignableObjectExpressionProp(prop: N.Node): boolean {
    if (prop.kind === "get" || prop.kind === "set") {
      throw this.raise(
        prop.key.start,
        "Object pattern can't contain getter or setter",
      );
    } else if (prop.method) {
      throw this.raise(prop.key.start, "Object pattern can't contain methods");
    }

    return false;
  }
}
