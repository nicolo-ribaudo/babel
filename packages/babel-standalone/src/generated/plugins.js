/*
 * This file is auto-generated! Do not modify it directly.
 * To re-generate run 'yarn gulp generate-standalone'
 */
import externalHelpers from "@babel/plugin-external-helpers";
import syntaxAsyncGenerators from "@babel/plugin-syntax-async-generators";
import syntaxClassProperties from "@babel/plugin-syntax-class-properties";
import syntaxClassStaticBlock from "@babel/plugin-syntax-class-static-block";
import syntaxDecimal from "@babel/plugin-syntax-decimal";
import syntaxDecorators from "@babel/plugin-syntax-decorators";
import syntaxDoExpressions from "@babel/plugin-syntax-do-expressions";
import syntaxExportDefaultFrom from "@babel/plugin-syntax-export-default-from";
import syntaxFlow from "@babel/plugin-syntax-flow";
import syntaxFunctionBind from "@babel/plugin-syntax-function-bind";
import syntaxFunctionSent from "@babel/plugin-syntax-function-sent";
import syntaxImportMeta from "@babel/plugin-syntax-import-meta";
import syntaxJsx from "@babel/plugin-syntax-jsx";
import syntaxImportAssertions from "@babel/plugin-syntax-import-assertions";
import syntaxObjectRestSpread from "@babel/plugin-syntax-object-rest-spread";
import syntaxOptionalCatchBinding from "@babel/plugin-syntax-optional-catch-binding";
import syntaxPipelineOperator from "@babel/plugin-syntax-pipeline-operator";
import syntaxRecordAndTuple from "@babel/plugin-syntax-record-and-tuple";
import syntaxTopLevelAwait from "@babel/plugin-syntax-top-level-await";
import syntaxTypescript from "@babel/plugin-syntax-typescript";
import proposalClassProperties from "@babel/plugin-proposal-class-properties";
import proposalClassStaticBlock from "@babel/plugin-proposal-class-static-block";
import proposalDecorators from "@babel/plugin-proposal-decorators";
import proposalDoExpressions from "@babel/plugin-proposal-do-expressions";
import proposalExportDefaultFrom from "@babel/plugin-proposal-export-default-from";
import proposalFunctionBind from "@babel/plugin-proposal-function-bind";
import proposalFunctionSent from "@babel/plugin-proposal-function-sent";
import proposalPipelineOperator from "@babel/plugin-proposal-pipeline-operator";
import proposalPrivateMethods from "@babel/plugin-proposal-private-methods";
import proposalPrivatePropertyInObject from "@babel/plugin-proposal-private-property-in-object";
import proposalThrowExpressions from "@babel/plugin-proposal-throw-expressions";
import transformFlowComments from "@babel/plugin-transform-flow-comments";
import transformFlowStripTypes from "@babel/plugin-transform-flow-strip-types";
import transformJscript from "@babel/plugin-transform-jscript";
import transformModulesAmd from "@babel/plugin-transform-modules-amd";
import transformModulesCommonjs from "@babel/plugin-transform-modules-commonjs";
import transformModulesSystemjs from "@babel/plugin-transform-modules-systemjs";
import transformModulesUmd from "@babel/plugin-transform-modules-umd";
import transformObjectAssign from "@babel/plugin-transform-object-assign";
import transformObjectSetPrototypeOfToAssign from "@babel/plugin-transform-object-set-prototype-of-to-assign";
import transformPropertyMutators from "@babel/plugin-transform-property-mutators";
import transformProtoToAssign from "@babel/plugin-transform-proto-to-assign";
import transformReactConstantElements from "@babel/plugin-transform-react-constant-elements";
import transformReactDisplayName from "@babel/plugin-transform-react-display-name";
import transformReactInlineElements from "@babel/plugin-transform-react-inline-elements";
import transformReactJsx from "@babel/plugin-transform-react-jsx";
import transformReactJsxCompat from "@babel/plugin-transform-react-jsx-compat";
import transformReactJsxDevelopment from "@babel/plugin-transform-react-jsx-development";
import transformReactJsxSelf from "@babel/plugin-transform-react-jsx-self";
import transformReactJsxSource from "@babel/plugin-transform-react-jsx-source";
import transformRuntime from "@babel/plugin-transform-runtime";
import transformStrictMode from "@babel/plugin-transform-strict-mode";
import transformTypescript from "@babel/plugin-transform-typescript";
export {
  externalHelpers,
  syntaxAsyncGenerators,
  syntaxClassProperties,
  syntaxClassStaticBlock,
  syntaxDecimal,
  syntaxDecorators,
  syntaxDoExpressions,
  syntaxExportDefaultFrom,
  syntaxFlow,
  syntaxFunctionBind,
  syntaxFunctionSent,
  syntaxImportMeta,
  syntaxJsx,
  syntaxImportAssertions,
  syntaxObjectRestSpread,
  syntaxOptionalCatchBinding,
  syntaxPipelineOperator,
  syntaxRecordAndTuple,
  syntaxTopLevelAwait,
  syntaxTypescript,
  proposalClassProperties,
  proposalClassStaticBlock,
  proposalDecorators,
  proposalDoExpressions,
  proposalExportDefaultFrom,
  proposalFunctionBind,
  proposalFunctionSent,
  proposalPipelineOperator,
  proposalPrivateMethods,
  proposalPrivatePropertyInObject,
  proposalThrowExpressions,
  transformFlowComments,
  transformFlowStripTypes,
  transformJscript,
  transformModulesAmd,
  transformModulesCommonjs,
  transformModulesSystemjs,
  transformModulesUmd,
  transformObjectAssign,
  transformObjectSetPrototypeOfToAssign,
  transformPropertyMutators,
  transformProtoToAssign,
  transformReactConstantElements,
  transformReactDisplayName,
  transformReactInlineElements,
  transformReactJsx,
  transformReactJsxCompat,
  transformReactJsxDevelopment,
  transformReactJsxSelf,
  transformReactJsxSource,
  transformRuntime,
  transformStrictMode,
  transformTypescript,
};
export const all = {
  "proposal-async-generator-functions":
    "internal:transform-async-generator-functions",
  "proposal-dynamic-import": "internal:transform-dynamic-import",
  "proposal-export-namespace-from": "internal:transform-export-namespace-from",
  "proposal-json-strings": "internal:transform-json-strings",
  "proposal-logical-assignment-operators":
    "internal:transform-logical-assignment-operators",
  "proposal-nullish-coalescing-operator":
    "internal:transform-nullish-coalescing-operator",
  "proposal-numeric-separator": "internal:transform-numeric-separator",
  "proposal-object-rest-spread": "internal:transform-object-rest-spread",
  "proposal-optional-catch-binding":
    "internal:transform-optional-catch-binding",
  "proposal-optional-chaining": "internal:transform-optional-chaining",
  "proposal-unicode-property-regex":
    "internal:transform-unicode-property-regex",
  "transform-arrow-functions": "internal:transform-arrow-functions",
  "transform-async-to-generator": "internal:transform-async-to-generator",
  "transform-block-scoped-functions":
    "internal:transform-block-scoped-functions",
  "transform-block-scoping": "internal:transform-block-scoping",
  "transform-classes": "internal:transform-classes",
  "transform-computed-properties": "internal:transform-computed-properties",
  "transform-destructuring": "internal:transform-destructuring",
  "transform-dotall-regex": "internal:transform-dotall-regex",
  "transform-duplicate-keys": "internal:transform-duplicate-keys",
  "transform-exponentiation-operator":
    "internal:transform-exponentiation-operator",
  "transform-for-of": "internal:transform-for-of",
  "transform-function-name": "internal:transform-function-name",
  "transform-instanceof": "internal:transform-instanceof",
  "transform-literals": "internal:transform-literals",
  "transform-member-expression-literals":
    "internal:transform-member-expression-literals",
  "transform-named-capturing-groups-regex":
    "internal:transform-named-capturing-groups-regex",
  "transform-new-target": "internal:transform-new-target",
  "transform-object-super": "internal:transform-object-super",
  "transform-parameters": "internal:transform-parameters",
  "transform-property-literals": "internal:transform-property-literals",
  "transform-regenerator": "internal:transform-regenerator",
  "transform-reserved-words": "internal:transform-reserved-words",
  "transform-shorthand-properties": "internal:transform-shorthand-properties",
  "transform-spread": "internal:transform-spread",
  "transform-sticky-regex": "internal:transform-sticky-regex",
  "transform-template-literals": "internal:transform-template-literals",
  "transform-typeof-symbol": "internal:transform-typeof-symbol",
  "transform-unicode-escapes": "internal:transform-unicode-escapes",
  "transform-unicode-regex": "internal:transform-unicode-regex",
  "external-helpers": externalHelpers,
  "syntax-async-generators": syntaxAsyncGenerators,
  "syntax-class-properties": syntaxClassProperties,
  "syntax-class-static-block": syntaxClassStaticBlock,
  "syntax-decimal": syntaxDecimal,
  "syntax-decorators": syntaxDecorators,
  "syntax-do-expressions": syntaxDoExpressions,
  "syntax-export-default-from": syntaxExportDefaultFrom,
  "syntax-flow": syntaxFlow,
  "syntax-function-bind": syntaxFunctionBind,
  "syntax-function-sent": syntaxFunctionSent,
  "syntax-import-meta": syntaxImportMeta,
  "syntax-jsx": syntaxJsx,
  "syntax-import-assertions": syntaxImportAssertions,
  "syntax-object-rest-spread": syntaxObjectRestSpread,
  "syntax-optional-catch-binding": syntaxOptionalCatchBinding,
  "syntax-pipeline-operator": syntaxPipelineOperator,
  "syntax-record-and-tuple": syntaxRecordAndTuple,
  "syntax-top-level-await": syntaxTopLevelAwait,
  "syntax-typescript": syntaxTypescript,
  "proposal-class-properties": proposalClassProperties,
  "proposal-class-static-block": proposalClassStaticBlock,
  "proposal-decorators": proposalDecorators,
  "proposal-do-expressions": proposalDoExpressions,
  "proposal-export-default-from": proposalExportDefaultFrom,
  "proposal-function-bind": proposalFunctionBind,
  "proposal-function-sent": proposalFunctionSent,
  "proposal-pipeline-operator": proposalPipelineOperator,
  "proposal-private-methods": proposalPrivateMethods,
  "proposal-private-property-in-object": proposalPrivatePropertyInObject,
  "proposal-throw-expressions": proposalThrowExpressions,
  "transform-flow-comments": transformFlowComments,
  "transform-flow-strip-types": transformFlowStripTypes,
  "transform-jscript": transformJscript,
  "transform-modules-amd": transformModulesAmd,
  "transform-modules-commonjs": transformModulesCommonjs,
  "transform-modules-systemjs": transformModulesSystemjs,
  "transform-modules-umd": transformModulesUmd,
  "transform-object-assign": transformObjectAssign,
  "transform-object-set-prototype-of-to-assign": transformObjectSetPrototypeOfToAssign,
  "transform-property-mutators": transformPropertyMutators,
  "transform-proto-to-assign": transformProtoToAssign,
  "transform-react-constant-elements": transformReactConstantElements,
  "transform-react-display-name": transformReactDisplayName,
  "transform-react-inline-elements": transformReactInlineElements,
  "transform-react-jsx": transformReactJsx,
  "transform-react-jsx-compat": transformReactJsxCompat,
  "transform-react-jsx-development": transformReactJsxDevelopment,
  "transform-react-jsx-self": transformReactJsxSelf,
  "transform-react-jsx-source": transformReactJsxSource,
  "transform-runtime": transformRuntime,
  "transform-strict-mode": transformStrictMode,
  "transform-typescript": transformTypescript,
};
