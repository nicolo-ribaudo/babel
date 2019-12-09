// @flow

import type { Options } from "../options";
import type State from "../tokenizer/state";
import type { TokenType } from "../tokenizer/types";
import type { PluginsMap } from "./index";
import type ScopeHandler from "../util/scope";
import type { BindingTypes } from "../util/scopeflags";
import type {
  MaybePlaceholder,
  PlaceholderTypes,
} from "../plugins/placeholders";
import * as N from "../types";

export default class BaseParser {
  // Properties set by constructor in index.js
  options: Options;
  inModule: boolean;
  scope: ScopeHandler<*>;
  plugins: PluginsMap;
  filename: ?string;
  sawUnambiguousESM: boolean = false;
  ambiguousScriptDifferentAst: boolean = false;

  // Initialized by Tokenizer
  state: State;
  // input and length are not in state as they are constant and we do
  // not want to ever copy them, which happens if state gets cloned
  input: string;
  length: number;

  // From old plugins
  +shouldParseV8Intrinsic: () => boolean;
  +parseV8Intrinsic: () => N.Expression;

  +shouldParsePlaceholder: () => boolean;
  +parsePlaceholder: <T: PlaceholderTypes>(
    expectedNode: T,
  ) => /*?N.Placeholder<T>*/ MaybePlaceholder<T>;
  +placeholderGetTokenFromCode: (code: number) => boolean;
  +placeholderToAssignable: (node: N.Node) => boolean;
  +parseExpressionStatementFromPlaceholder: (
    node: MaybePlaceholder<"Statement">,
    expr: N.Expression,
  ) => MaybePlaceholder<"Statement">;
  +parseClassWithPlaceholder: <T: N.Class>(
    node: T,
    type: $PropertyType<T, "type">,
    optionalId?: boolean,
  ) => ?T;
  +parseExportHeadWithPlaceholder: (node: N.Node) => boolean;
  +parseImportWithPlaceholder: (
    node: N.Node,
  ) => {| hasDefault: boolean, sourceParsed: boolean |};

  +jsxParseExprAtom: () => ?N.Expression;
  +jsxGetTokenFromCode: (code: number) => boolean;
  +jsxUpdateContext: (prevType: TokenType) => boolean;

  +estreeCheckDeclaration: (node: N.Pattern | N.ObjectProperty) => boolean;
  +estreeCheckGetterSetterParams: (
    method: N.ObjectMethod | N.ClassMethod,
  ) => void;
  +estreeCheckLVal: (
    expr: N.Expression,
    bindingType: BindingTypes,
    checkClashes: ?{ [key: string]: boolean },
    contextDescription: string,
    disallowLetBinding?: boolean,
  ) => boolean;
  +estreeIsStrictBody: (node: { body: N.BlockStatement }) => boolean;
  +estreeIsValidDirective: (stmt: N.Statement) => boolean;
  +estreeParseExprAtom: () => ?N.Expression;
  +estreeToAssignable: (
    node: N.Node,
    isBinding: ?boolean,
    contextDescription: string,
  ) => boolean;
  +estreeToAssignableObjectExpressionProp: (prop: N.Node) => boolean;
  +estreeMethodToFunction: <T: N.MethodLike>(node: T, type: string) => T;

  hasPlugin(name: string): boolean {
    return this.plugins.has(name);
  }

  getPluginOption(plugin: string, name: string) {
    // $FlowIssue
    if (this.hasPlugin(plugin)) return this.plugins.get(plugin)[name];
  }
}
