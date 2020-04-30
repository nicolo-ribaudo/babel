import type Printer from "../printer";
import * as t from "@babel/types";
import jsesc from "jsesc";

export function Identifier(this: Printer, node: any) {
  this.exactSource(node.loc, () => {
    this.word(node.name);
  });
}

export function ArgumentPlaceholder(this: Printer) {
  this.token("?");
}

export function RestElement(this: Printer, node: any) {
  this.token("...");
  this.print(node.argument, node);
}

export { RestElement as SpreadElement };

export function ObjectExpression(this: Printer, node: any) {
  const props = node.properties;

  this.token("{");
  this.printInnerComments(node);

  if (props.length) {
    this.space();
    this.printList(props, node, { indent: true, statement: true });
    this.space();
  }

  this.token("}");
}

export { ObjectExpression as ObjectPattern };

export function ObjectMethod(this: Printer, node: any) {
  this.printJoin(node.decorators, node);
  this._methodHead(node);
  this.space();
  this.print(node.body, node);
}

export function ObjectProperty(this: Printer, node: any) {
  this.printJoin(node.decorators, node);

  if (node.computed) {
    this.token("[");
    this.print(node.key, node);
    this.token("]");
  } else {
    // print `({ foo: foo = 5 } = {})` as `({ foo = 5 } = {});`
    if (
      t.isAssignmentPattern(node.value) &&
      t.isIdentifier(node.key) &&
      node.key.name === node.value.left.name
    ) {
      this.print(node.value, node);
      return;
    }

    this.print(node.key, node);

    // shorthand!
    if (
      node.shorthand &&
      t.isIdentifier(node.key) &&
      t.isIdentifier(node.value) &&
      node.key.name === node.value.name
    ) {
      return;
    }
  }

  this.token(":");
  this.space();
  this.print(node.value, node);
}

export function ArrayExpression(this: Printer, node: any) {
  const elems = node.elements;
  const len = elems.length;

  this.token("[");
  this.printInnerComments(node);

  for (let i = 0; i < elems.length; i++) {
    const elem = elems[i];
    if (elem) {
      if (i > 0) this.space();
      this.print(elem, node);
      if (i < len - 1) this.token(",");
    } else {
      // If the array expression ends with a hole, that hole
      // will be ignored by the interpreter, but if it ends with
      // two (or more) holes, we need to write out two (or more)
      // commas so that the resulting code is interpreted with
      // both (all) of the holes.
      this.token(",");
    }
  }

  this.token("]");
}

export { ArrayExpression as ArrayPattern };

export function RecordExpression(this: Printer, node: any) {
  const props = node.properties;

  let startToken;
  let endToken;
  if (this.format.recordAndTupleSyntaxType === "bar") {
    startToken = "{|";
    endToken = "|}";
  } else if (this.format.recordAndTupleSyntaxType === "hash") {
    startToken = "#{";
    endToken = "}";
  } else {
    throw new Error(
      `The "recordAndTupleSyntaxType" generator option must be "bar" or "hash" (${JSON.stringify(
        this.format.recordAndTupleSyntaxType,
      )} received).`,
    );
  }

  this.token(startToken);
  this.printInnerComments(node);

  if (props.length) {
    this.space();
    this.printList(props, node, { indent: true, statement: true });
    this.space();
  }
  this.token(endToken);
}

export function TupleExpression(this: Printer, node: any) {
  const elems = node.elements;
  const len = elems.length;

  let startToken;
  let endToken;
  if (this.format.recordAndTupleSyntaxType === "bar") {
    startToken = "[|";
    endToken = "|]";
  } else if (this.format.recordAndTupleSyntaxType === "hash") {
    startToken = "#[";
    endToken = "]";
  } else {
    throw new Error(
      `${this.format.recordAndTupleSyntaxType} is not a valid recordAndTuple syntax type`,
    );
  }

  this.token(startToken);
  this.printInnerComments(node);

  for (let i = 0; i < elems.length; i++) {
    const elem = elems[i];
    if (elem) {
      if (i > 0) this.space();
      this.print(elem, node);
      if (i < len - 1) this.token(",");
    }
  }

  this.token(endToken);
}

export function RegExpLiteral(this: Printer, node: any) {
  this.word(`/${node.pattern}/${node.flags}`);
}

export function BooleanLiteral(this: Printer, node: any) {
  this.word(node.value ? "true" : "false");
}

export function NullLiteral(this: Printer) {
  this.word("null");
}

export function NumericLiteral(this: Printer, node: any) {
  const raw = this.getPossibleRaw(node);
  const opts = this.format.jsescOption;
  const value = node.value + "";
  if (opts.numbers) {
    this.number(jsesc(node.value, opts));
  } else if (raw == null) {
    this.number(value); // normalize
  } else if (this.format.minified) {
    this.number(raw.length < value.length ? raw : value);
  } else {
    this.number(raw);
  }
}

export function StringLiteral(this: Printer, node: any) {
  const raw = this.getPossibleRaw(node);
  if (!this.format.minified && raw != null) {
    this.token(raw);
    return;
  }

  // ensure the output is ASCII-safe
  const opts = this.format.jsescOption;
  if (this.format.jsonCompatibleStrings) {
    opts.json = true;
  }
  const val = jsesc(node.value, opts);

  return this.token(val);
}

export function BigIntLiteral(this: Printer, node: any) {
  const raw = this.getPossibleRaw(node);
  if (!this.format.minified && raw != null) {
    this.token(raw);
    return;
  }
  this.token(node.value + "n");
}

export function DecimalLiteral(this: Printer, node: any) {
  const raw = this.getPossibleRaw(node);
  if (!this.format.minified && raw != null) {
    this.token(raw);
    return;
  }
  this.token(node.value + "m");
}

export function PipelineTopicExpression(this: Printer, node: any) {
  this.print(node.expression, node);
}

export function PipelineBareFunction(this: Printer, node: any) {
  this.print(node.callee, node);
}

export function PipelinePrimaryTopicReference(this: Printer) {
  this.token("#");
}