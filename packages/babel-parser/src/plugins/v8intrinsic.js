import { types as tt } from "../tokenizer/types";
import * as N from "../types";
import StatementParser from "../parser/statement";

export default class V8IntrinsicParser extends StatementParser {
  shouldParseV8Intrinsic(): boolean {
    return this.match(tt.modulo);
  }

  parseV8Intrinsic(): N.Expression {
    const v8IntrinsicStart = this.state.start;
    // let the `loc` of Identifier starts from `%`
    const node = this.startNode();
    this.eat(tt.modulo);
    if (this.match(tt.name)) {
      const name = this.parseIdentifierName(this.state.start);
      const identifier = this.createIdentifier(node, name);
      identifier.type = "V8IntrinsicIdentifier";
      if (this.match(tt.parenL)) {
        return identifier;
      }
    }
    this.unexpected(v8IntrinsicStart);
  }
}
