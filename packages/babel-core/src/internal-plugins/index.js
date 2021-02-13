/* eslint sort-keys: "error" */

export const plugins = {
  __proto__: null,
  "transform-arrow-functions": transformArrowFunctions,
  "transform-async-generator-functions": transformAsyncGeneratorFunctions,
  "transform-async-to-generator": transformAsyncToGenerator,
  "transform-block-scoped-functions": transformBlockScopedFunctions,
  "transform-block-scoping": transformBlockScoping,
  "transform-classes": transformClasses,
  "transform-computed-properties": transformComputedProperties,
  "transform-destructuring": transformDestructuring,
  "transform-dotall-regex": transformDotallRegex,
  "transform-duplicate-keys": transformDuplicateKeys,
  "transform-dynamic-import": transformDynamicImport,
  "transform-exponentiation-operator": transformExponentiationOperator,
  "transform-export-namespace-from": transformExportNamespaceFrom,
  "transform-for-of": transformForOf,
  "transform-function-name": transformFunctionName,
  "transform-instanceof": transformInstanceof,
  "transform-json-strings": transformJsonStrings,
  "transform-literals": transformLiterals,
  "transform-logical-assignment-operators": transformLogicalAssignmentOperators,
  "transform-member-expression-literals": transformMemberExpressionLiterals,
  "transform-named-capturing-groups-regex": transformNamedCapturingGroupsRegex,
  "transform-new-target": transformNewTarget,
  "transform-nullish-coalescing-operator": transformNullishCoalescingOperator,
  "transform-numeric-separator": transformNumericSeparator,
  "transform-object-rest-spread": transformObjectRestSpread,
  "transform-object-super": transformObjectSuper,
  "transform-optional-catch-binding": transformOptionalCatchBinding,
  "transform-optional-chaining": transformOptionalChaining,
  "transform-parameters": transformParameters,
  "transform-property-literals": transformPropertyLiterals,
  "transform-regenerator": transformRegenerator,
  "transform-reserved-words": transformReservedWords,
  "transform-shorthand-properties": transformShorthandProperties,
  "transform-spread": transformSpread,
  "transform-sticky-regex": transformStickyRegex,
  "transform-template-literals": transformTemplateLiterals,
  "transform-typeof-symbol": transformTypeofSymbol,
  "transform-unicode-escapes": transformUnicodeEscapes,
  "transform-unicode-property-regex": transformUnicodePropertyRegex,
  "transform-unicode-regex": transformUnicodeRegex,
};

/* prettier-ignore */
const aliases = {
  __proto__: null,

  // Some plugins have been renamed when moved to @babel/core. We store them here
  // so that packages such as @babel/preset-env or @babel/standalone can use
  // internalPluginName to get the new name.
  "proposal-async-generator-functions": "transform-async-generator-functions",
  "proposal-dynamic-import": "transform-dynamic-import",
  "proposal-export-namespace-from": "transform-export-namespace-from",
  "proposal-json-strings": "transform-json-strings",
  "proposal-logical-assignment-operators": "transform-logical-assignment-operators",
  "proposal-nullish-coalescing-operator": "transform-nullish-coalescing-operator",
  "proposal-numeric-separator": "transform-numeric-separator",
  "proposal-object-rest-spread": "transform-object-rest-spread",
  "proposal-optional-catch-binding": "transform-optional-catch-binding",
  "proposal-optional-chaining": "transform-optional-chaining",
  "proposal-unicode-property-regex": "transform-unicode-property-regex",
};

export function internalPluginName(name: string): string | undefined {
  if (name in plugins) {
    return `internal:${name}`;
  } else if (name in aliases) {
    return `internal:${aliases[name]}`;
  }
}

import transformAsyncGeneratorFunctions from "./transform-async-generator-functions";
import transformAsyncToGenerator from "./transform-async-to-generator";
import transformArrowFunctions from "./transform-arrow-functions";
import transformBlockScopedFunctions from "./transform-block-scoped-functions";
import transformBlockScoping from "./transform-block-scoping";
import transformClasses from "./transform-classes";
import transformComputedProperties from "./transform-computed-properties";
import transformDestructuring from "./transform-destructuring";
import transformDotallRegex from "./transform-dotall-regex";
import transformDuplicateKeys from "./transform-duplicate-keys";
import transformDynamicImport from "./transform-dynamic-import";
import transformExponentiationOperator from "./transform-exponentiation-operator";
import transformExportNamespaceFrom from "./transform-export-namespace-from";
import transformForOf from "./transform-for-of";
import transformFunctionName from "./transform-function-name";
import transformInstanceof from "./transform-instanceof";
import transformJsonStrings from "./transform-json-strings";
import transformLiterals from "./transform-literals";
import transformLogicalAssignmentOperators from "./transform-logical-assignment-operators";
import transformMemberExpressionLiterals from "./transform-member-expression-literals";
import transformNamedCapturingGroupsRegex from "./transform-named-capturing-groups-regex";
import transformNewTarget from "./transform-new-target";
import transformNullishCoalescingOperator from "./transform-nullish-coalescing-operator";
import transformNumericSeparator from "./transform-numeric-separator";
import transformObjectRestSpread from "./transform-object-rest-spread";
import transformObjectSuper from "./transform-object-super";
import transformOptionalCatchBinding from "./transform-optional-catch-binding";
import transformOptionalChaining from "./transform-optional-chaining";
import transformParameters from "./transform-parameters";
import transformPropertyLiterals from "./transform-property-literals";
import transformRegenerator from "./transform-regenerator";
import transformReservedWords from "./transform-reserved-words";
import transformShorthandProperties from "./transform-shorthand-properties";
import transformSpread from "./transform-spread";
import transformStickyRegex from "./transform-sticky-regex";
import transformTemplateLiterals from "./transform-template-literals";
import transformTypeofSymbol from "./transform-typeof-symbol";
import transformUnicodeEscapes from "./transform-unicode-escapes";
import transformUnicodePropertyRegex from "./transform-unicode-property-regex";
import transformUnicodeRegex from "./transform-unicode-regex";
