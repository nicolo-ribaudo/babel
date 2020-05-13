// @ts-check

export {};

type _If<Test, Then, Else = {}> = Test extends true ? Then : Else;

type _Assert<Test, Then = {}> = _If<Test, Then, never>;

type _Flow<F extends _F, Then, Else = {}> = _If<F["Flow"], Then, Else>;
type _TS<F extends _F, Then, Else = {}> = _If<F["TypeScript"], Then, Else>;
type _Types<F extends _F, Then, Else = {}> = _If<
  F["Flow"] | F["TypeScript"],
  Then,
  Else
>;
type _NotEstree<F extends _F, Then = {}, Else = never> = _If<
  F["ESTree"],
  Else,
  Then
>;

// AST flags and default values
type _F = {
  Flow?: boolean;
  TypeScript?: boolean;
  JSX?: boolean;
  ESTree?: boolean;
};
type _D = { Flow: true; TypeScript: true; JSX: true; ESTree: false };

type $ReadOnlyArray<T> = readonly T[];

type _N<Name> = {
  type: Name;

  start: number;
  end: number;
  loc: SourceLocation;
  range?: [number, number];
  leadingComments?: Array<Comment>;
  trailingComments?: Array<Comment>;
  innerComments?: Array<Comment>;

  extra?: { [key: string]: any };
};

// TODO
type Token = any;
type SourceLocation = any;
type SourceType = string;
type _TypeParameterInstantiation<T> = {};
type _TypeParameterDeclaration<T> = {};
type TsTypeParameterDeclaration<T> = {};
type TsTypeParameterInstantiation<T> = {};
type TypeAnnotationBase<T> = {};
type DeclarationBase<T> = {};
type _TypeAnnotation<T> = {};
type TsTypeParameter<T> = {};
type TsTypeAnnotation<T> = {};

type Comment = {
  type: "CommentBlock" | "CommentLine";
  value: string;
  start: number;
  end: number;
  loc: SourceLocation;
};

/*=======================================================*\
|                     PROGRAMS                            |
\*=======================================================*/

export type File<F extends _F> = _N<"File"> & {
  program: Program<F>;
  comments: $ReadOnlyArray<Comment>;
  tokens: $ReadOnlyArray<Token | Comment>;
  errors: string[];
};

type Program<F extends _F> = _N<"Program"> & {
  sourceType: SourceType;
  body: Array<Statement<F> | ModuleDeclaration<F>>; // TODO: $ReadOnlyArray
  interpreter: InterpreterDirective<F> | null;
} & _NotEstree<F, { directives: $ReadOnlyArray<Directive<F>> }, {}>;

type InterpreterDirective<F extends _F> = _N<"InterpreterDirective"> & {
  value: string;
};

type Directive<F extends _F> = _N<"Directive"> & { value: DirectiveLiteral<F> };

type DirectiveLiteral<F extends _F> = _N<"DirectiveLiteral"> & {
  value: string;
};

/*=======================================================*\
|                     LITERALS                            |
\*=======================================================*/

type Identifier<F extends _F> = _N<"Identifier"> &
  PatternBase<F> & { name: string } & _TS<
    F, // Used in case of an optional parameter.
    { optional?: boolean }
  >;

type Literal<F extends _F> =
  | RegExpLiteral<F>
  | NullLiteral<F>
  | StringLiteral<F>
  | BooleanLiteral<F>
  | NumericLiteral<F>
  | BigIntLiteral<F>
  | EstreeLiteral<F>;

type RegExpLiteral<F extends _F> = _NotEstree<F> &
  _N<"RegExpLiteral"> & {
    pattern: string;
    flags: string;
  };

type NullLiteral<F extends _F> = _NotEstree<F> & _N<"NullLiteral">;

type StringLiteral<F extends _F> = _NotEstree<F> &
  _N<"StringLiteral"> & {
    value: string;
  };

type BooleanLiteral<F extends _F> = _NotEstree<F> &
  _N<"BooleanLiteral"> & {
    value: boolean;
  };

type NumericLiteral<F extends _F> = _NotEstree<F> &
  _N<"NumericLiteral"> & {
    value: number;
  };

type BigIntLiteral<F extends _F> = _NotEstree<F> &
  _N<"BigIntLiteral"> & {
    value: number;
  };

/*=======================================================*\
|                     EXPRESSIONS                         |
\*=======================================================*/

type Expression<F extends _F> =
  | UnaryExpression<F>
  | UpdateExpression<F>
  | BinaryExpression<F>
  | AssignmentExpression<F>
  | LogicalExpression<F>
  | ConditionalExpression<F>
  | SequenceExpression<F>
  | AwaitExpression<F>
  | YieldExpression<F>
  // calls
  | MemberExpression<F>
  | CallExpression<F>
  | NewExpression<F>
  | OptionalMemberExpression<F>
  | OptionalCallExpression<F>
  | BindExpression<F> // proposal
  // primary
  | ThisExpression<F>
  | Identifier<F>
  | Literal<F>
  | ArrayExpression<F>
  | ObjectExpression<F>
  | TupleExpression<F> // proposal
  | RecordExpression<F> // proposal
  | FunctionExpression<F>
  | ArrowFunctionExpression<F>
  | ClassExpression<F>
  | TemplateLiteral<F>
  | TaggedTemplateExpression<F>
  | ParenthesizedExpression<F>
  // estree
  | EstreeImportExpression<F>
  | never;

type ClassExpression<F extends _F> = _N<"ClassExpression"> & ClassBase<F>;

type FunctionExpression<F extends _F> = _N<"FunctionExpression"> &
  MethodBase<F>;

type ArrowFunctionExpression<F extends _F> = _N<"ArrowFunctionExpression"> &
  FunctionBase<F> & {
    body: BlockStatement<F> | Expression<F>;
  };

type UnaryExpression<F extends _F> = _N<"UnaryExpression"> & {
  operator: UnaryOperator;
  prefix: boolean;
  argument: Expression<F>;
};

type UnaryOperator =
  | "-"
  | "+"
  | "!"
  | "~"
  | "typeof"
  | "void"
  | "delete"
  | "throw"; // proposal

type UpdateExpression<F extends _F> = _N<"UpdateExpression"> & {
  operator: UpdateOperator;
  argument: Expression<F>;
  prefix: boolean;
};

type UpdateOperator = "++" | "--";

// Binary operations

type BinaryExpression<F extends _F> = _N<"BinaryExpression"> & {
  operator: BinaryOperator;
  left: Expression<F>;
  right: Expression<F>;
};

type BinaryOperator =
  | "=="
  | "!="
  | "==="
  | "!=="
  | "<"
  | "<="
  | ">"
  | ">="
  | "<<"
  | ">>"
  | ">>>"
  | "+"
  | "-"
  | "*"
  | "/"
  | "%"
  | "|"
  | "^"
  | "&"
  | "|>"
  | "in"
  | "instanceof";

type AssignmentExpression<F extends _F> = _N<"AssignmentExpression"> & {
  operator: AssignmentOperator;
  left: Pattern<F>;
  right: Expression<F>;
};

type AssignmentOperator =
  | "="
  | "+="
  | "-="
  | "*="
  | "/="
  | "%="
  | "<<="
  | ">>="
  | ">>>="
  | "|="
  | "^="
  | "&="
  | "||="
  | "&&="
  | "??=";

type LogicalExpression<F extends _F> = _N<"LogicalExpression"> & {
  operator: LogicalOperator;
  left: Expression<F>;
  right: Expression<F>;
};

type LogicalOperator = "||" | "&&" | "??";

type ConditionalExpression<F extends _F> = _N<"ConditionalExpression"> & {
  type: "";
  test: Expression<F>;
  alternate: Expression<F>;
  consequent: Expression<F>;
};

type SpreadElement<F extends _F> = _N<"SpreadElement"> & {
  argument: Expression<F>;
};

type MemberExpression<F extends _F> = _N<"MemberExpression"> & {
  object: Expression<F> | Super<F>;
  property: Expression<F>;
  computed: boolean;
};

type OptionalMemberExpression<F extends _F> = _N<"OptionalMemberExpression"> & {
  object: Expression<F> | Super<F>;
  property: Expression<F>;
  computed: boolean;
  optional: boolean;
};

type OptionalCallExpression<F extends _F> = _N<"OptionalCallExpression"> &
  CallOrNewBase<F> & { optional: boolean };

type BindExpression<F extends _F> = _N<"BindExpression"> & {
  object: Expression<F> | void;
  callee: Expression<F>;
};

type ArgumentPlaceholder<F extends _F> = _N<"ArgumentPlaceholder">;

type CallOrNewBase<F extends _F> = {
  callee: Expression<F> | Super<F> | Import<F>;
  arguments: Array<Expression<F> | SpreadElement<F> | ArgumentPlaceholder<F>>; // TODO: $ReadOnlyArray
  typeArguments?: _TypeParameterInstantiation<F>;
  typeParameters?: _TypeParameterInstantiation<F>; // TODO: Not in spec
};

type CallExpression<F extends _F> = _N<"CallExpression"> & CallOrNewBase<F>;

type NewExpression<F extends _F> = _N<"CallExpression"> &
  CallOrNewBase<F> & {
    optional?: boolean; // TODO: Not in spec
  };

type SequenceExpression<F extends _F> = _N<"SequenceExpression"> & {
  expressions: $ReadOnlyArray<Expression<F>>;
};

type ThisExpression<F extends _F> = _N<"ThisExpression">;

type Import<F extends _F> = _NotEstree<F> & _N<"Import">;
type Super<F extends _F> = _N<"Super">;

type ParenthesizedExpression<F extends _F> = _N<"ParenthesizedExpression"> & {
  expression: Expression<F>;
};

type ArrayExpression<F extends _F> = _N<"ArrayExpression"> & {
  type: "ArrayExpression";
  elements: $ReadOnlyArray<Expression<F> | SpreadElement<F> | null>;
};

type TupleExpression<F extends _F> = _N<"TupleExpression"> & {
  elements: $ReadOnlyArray<Expression<F> | SpreadElement<F> | null>;
};

type ObjectExpression<F extends _F> = _N<"ObjectExpression"> & {
  properties: $ReadOnlyArray<
    ObjectProperty<F> | ObjectMethod<F> | SpreadElement<F>
  >;
};

type RecordExpression<F extends _F> = _N<"RecordExpression"> & {
  properties: $ReadOnlyArray<
    ObjectProperty<F> | ObjectMethod<F> | SpreadElement<F>
  >;
};

type ObjectMemberBase<F extends _F, Context extends "pattern" | "expr"> = {
  key: Expression<F>;
  computed: boolean;
  value: Context extends "expr" ? Expression<F> : Pattern<F>;
  decorators?: Context extends "expr" ? $ReadOnlyArray<Decorator<F>> : never;
} & _Flow<F, { variance?: FlowVariance<F> }> &
  _Types<F, { typeParameters?: _TypeParameterInstantiation<F> }>;

type ObjectPropertyBase<F extends _F, Context extends "pattern" | "expr"> = _N<
  "ObjectProperty"
> &
  ObjectMemberBase<F, Context> & { shorthand: boolean };

type ObjectProperty<F extends _F> = _N<"ObjectProperty"> &
  ObjectMemberBase<F, "expr">;

type ObjectMethod<F extends _F> = _N<"ObjectMethod"> &
  ObjectMemberBase<F, "expr"> &
  MethodBase<F> & {
    kind: "get" | "set" | "method"; // Never "constructor"
  };

type YieldExpression<F extends _F> = _N<"YieldExpression"> & {
  argument: Expression<F> | null;
  delegate: boolean;
};

type AwaitExpression<F extends _F> = _N<"AwaitExpression"> & {
  argument: Expression<F>;
};

type TemplateLiteral<F extends _F> = _N<"TemplateLiteral"> & {
  quasis: $ReadOnlyArray<TemplateElement<F>>;
  expressions: $ReadOnlyArray<Expression<F>>;
};

type TaggedTemplateExpression<F extends _F> = _N<"TaggedTemplateExpression"> & {
  tag: Expression<F>;
  quasi: TemplateLiteral<F>;
  typeParameters?: _TypeParameterInstantiation<F>; // TODO: Not in spec
};

type TemplateElement<F extends _F> = _N<"TemplateElement"> & {
  tail: boolean;
  value: {
    cooked: string;
    raw: string;
  };
};

type PipelineBody<F extends _F> = _N<"PipelineBody">;

type PipelineBareFunctionBody<F extends _F> = _N<"PipelineBareFunctionBody"> & {
  callee: Expression<F>;
};

type PipelineBareConstructorBody<F extends _F> = _N<
  "PipelineBareConstructorBody"
> & {
  callee: Expression<F>;
};

type PipelineBareAwaitedFunctionBody<F extends _F> = _N<
  "PipelineBareAwaitedFunctionBody"
> & {
  callee: Expression<F>;
};

type PipelineTopicBody<F extends _F> = _N<"PipelineTopicBody"> & {
  expression: Expression<F>;
};

type PipelineStyle =
  | "PipelineBareFunction"
  | "PipelineBareConstructor"
  | "PipelineBareAwaitedFunction"
  | "PipelineTopicExpression";

/*=======================================================*\
|                     STATEMENTS                          |
\*=======================================================*/

type Statement<F extends _F> =
  | Declaration<F>
  | ExpressionStatement<F>
  | BlockStatement<F>
  | EmptyStatement<F>
  | DebuggerStatement<F>
  | WithStatement<F>
  | ReturnStatement<F>
  | BreakStatement<F>
  | ContinueStatement<F>
  | LabeledStatement<F>
  | IfStatement<F>
  | SwitchStatement<F>
  | ThrowStatement<F>
  | TryStatement<F>
  | WhileStatement<F>
  | DoWhileStatement<F>
  | ForStatement<F>
  | ForInStatement<F>
  | ForOfStatement<F>;

type ExpressionStatement<F extends _F> = _N<"ExpressionStatement"> & {
  expression: Expression<F>;
};

type BlockStatement<F extends _F> = _N<"BlockStatement"> & {
  body: Array<Statement<F>>; // TODO: $ReadOnlyArray
} & _NotEstree<F, { directives: $ReadOnlyArray<Directive<F>> }, {}>;
// | Placeholder<"BlockStatement">;

type EmptyStatement<F extends _F> = _N<"EmptyStatement">;

type DebuggerStatement<F extends _F> = _N<"DebuggerStatement">;

type WithStatement<F extends _F> = _N<"WithStatement"> & {
  object: Expression<F>;
  body: Statement<F>;
};

type ReturnStatement<F extends _F> = _N<"ReturnStatement"> & {
  argument: Expression<F> | null;
};

type LabeledStatement<F extends _F> = _N<"LabeledStatement"> & {
  label: Identifier<F>;
  body: Statement<F>;
};

type BreakStatement<F extends _F> = _N<"BreakStatement"> & {
  label: Identifier<F> | null;
};

type ContinueStatement<F extends _F> = _N<"ContinueStatement"> & {
  label: Identifier<F> | null;
};

// Choice

type IfStatement<F extends _F> = _N<"IfStatement"> & {
  test: Expression<F>;
  consequent: Statement<F>;
  alternate: Statement<F> | null;
};

type SwitchStatement<F extends _F> = _N<"SwitchStatement"> & {
  discriminant: Expression<F>;
  cases: $ReadOnlyArray<SwitchCase<F>>;
};

type SwitchCase<F extends _F> = _N<"SwitchCase"> & {
  test: Expression<F> | null;
  consequent: $ReadOnlyArray<Statement<F>>;
};

// Exceptions

type ThrowStatement<F extends _F> = _N<"ThrowStatement"> & {
  argument: Expression<F>;
};

type TryStatement<F extends _F> = _N<"TryStatement"> & {
  block: BlockStatement<F>;
  handler: CatchClause<F> | null;
  finalizer: BlockStatement<F> | null;
};

type CatchClause<F extends _F> = _N<"CatchClause"> & {
  param: Pattern<F>;
  body: BlockStatement<F>;
};

// Loops

type WhileStatement<F extends _F> = _N<"WhileStatement"> & {
  test: Expression<F>;
  body: Statement<F>;
};

type DoWhileStatement<F extends _F> = _N<"DoWhileStatement"> & {
  body: Statement<F>;
  test: Expression<F>;
};

type ForStatement<F extends _F> = _N<"ForStatement"> & {
  init: VariableDeclaration<F> | Expression<F> | null;
  test: Expression<F> | null;
  update: Expression<F> | null;
  body: Statement<F>;
};

type ForInOfBase<F extends _F> = {
  left: VariableDeclaration<F> | Expression<F>;
  right: Expression<F>;
  body: Statement<F>;
};

type ForInStatement<F extends _F> = _N<"ForInStatement"> & ForInOfBase<F>;

type ForOfStatement<F extends _F> = _N<"ForOfStatement"> &
  ForInOfBase<F> & { await: boolean };

/*=======================================================*\
|                       PATTERNS                          |
\*=======================================================*/

type Pattern<F extends _F> =
  | Identifier<F>
  | ObjectPattern<F>
  | ArrayPattern<F>
  | RestElement<F>
  | AssignmentPattern<F>;

type PatternBase<F extends _F> = _TS<F, HasDecorators<F>> &
  _Types<F, { typeAnnotation?: TypeAnnotationBase<F> }>;

type AssignmentProperty<F extends _F> = ObjectPropertyBase<F, "pattern">;

type ObjectPattern<F extends _F> = _N<"ObjectPattern"> &
  PatternBase<F> & {
    properties: $ReadOnlyArray<AssignmentProperty<F> | RestElement<F>>;
  };

type ArrayPattern<F extends _F> = _N<"ArrayPattern"> &
  PatternBase<F> & {
    elements: $ReadOnlyArray<Pattern<F> | null>;
  };

type RestElement<F extends _F> = _N<"RestElement"> &
  PatternBase<F> & {
    argument: Pattern<F>;
  };

type AssignmentPattern<F extends _F> = _N<"AssignmentPattern"> &
  PatternBase<F> & {
    left: Pattern<F>;
    right: Expression<F>;
  };

/*=======================================================*\
|                     DECLARATIONS                        |
\*=======================================================*/

type Declaration<F extends _F> =
  | VariableDeclaration<F>
  | ClassDeclaration<F>
  | FunctionDeclaration<F>
  | _TS<
      F,
      | TsInterfaceDeclaration<F>
      | TsTypeAliasDeclaration<F>
      | TsEnumDeclaration<F>
      | TsModuleDeclaration<F>,
      never
    >;

type VariableDeclaration<F extends _F> = _N<"VariableDeclaration"> &
  DeclarationBase<F> & {
    declarations: $ReadOnlyArray<VariableDeclarator<F>>;
    kind: "var" | "let" | "const";
  };

type VariableDeclarator<F extends _F> = _N<"VariableDeclarator"> & {
  id: Pattern<F>;
  init: Expression<F> | null;
} & _TS<F, { definite?: true }>;

type FunctionDeclaration<
  F extends _F,
  IsDefaultExport extends boolean = false
> = _N<"FuctionDeclaration"> &
  FunctionBase<F> & {
    id: Identifier<F> | (IsDefaultExport extends true ? null : never);
  };

type ClassDeclaration<
  F extends _F,
  IsDefaultExport extends boolean = false
> = _N<"ClassDeclaration"> &
  ClassBase<F> &
  DeclarationBase<F> & {
    id: Identifier<F> | (IsDefaultExport extends true ? null : never);
  } & _TS<F, { abstract?: true }>;

/*=======================================================*\
|                       MODULES                           |
\*=======================================================*/

type ModuleDeclaration<F extends _F> = AnyImport<F> | AnyExport<F>;

type AnyImport<F extends _F> =
  | ImportDeclaration<F>
  | _TS<F, TsImportEqualsDeclaration<F>, never>;

type AnyExport<F extends _F> =
  | ExportNamedDeclaration<F>
  | ExportDefaultDeclaration<F>
  | ExportAllDeclaration<F>
  | _TS<
      F,
      | TsExportAssignment<F>
      | TsImportEqualsDeclaration<F>
      | TsNamespaceExportDeclaration<F>,
      never
    >;

type ModuleSpecifier<F extends _F> = { local: Identifier<F> };

// Imports

type ImportDeclaration<F extends _F> = _N<"ImportDeclaration"> & {
  // TODO: $ReadOnlyArray
  specifiers: Array<
    ImportSpecifier<F> | ImportDefaultSpecifier<F> | ImportNamespaceSpecifier<F>
  >;
  source: StringLiteral<F>;

  importKind?: "type" | "typeof" | "value"; // TODO: Not in spec
};

type ImportSpecifier<F extends _F> = _N<"ImportSpecifier"> &
  ModuleSpecifier<F> & { imported: Identifier<F> };

type ImportDefaultSpecifier<F extends _F> = _N<"ImportDefaultSpecifier"> &
  ModuleSpecifier<F>;

type ImportNamespaceSpecifier<F extends _F> = _N<"ImportNamespaceSpecifier"> &
  ModuleSpecifier<F>;

// Exports

type ExportNamedDeclaration<F extends _F> = _N<"ExportNamedDeclaration"> & {
  declaration: Declaration<F> | null;
  specifiers: $ReadOnlyArray<ExportSpecifier<F> | ExportDefaultSpecifier<F>>;
  source: StringLiteral<F> | null;

  exportKind?: "type" | "value"; // TODO: Not in spec
};

type ExportSpecifier<F extends _F> = _N<"ExportSpecifier"> & {
  exported: Identifier<F>;
  local: Identifier<F>;
};

type ExportDefaultSpecifier<F extends _F> = _N<"ExportDefaultSpecifier"> & {
  exported: Identifier<F>;
};

type ExportDefaultDeclaration<F extends _F> = _N<"ExportDefaultDeclaration"> & {
  declaration:
    | FunctionDeclaration<F, /* IsDefaultExport */ true>
    | TSDeclareFunction<F, /* IsDefaultExport */ true>
    | ClassDeclaration<F, /* IsDefaultExport */ true>
    | Expression<F>;
};

type ExportAllDeclaration<F extends _F> = _N<"ExportAllDeclaration"> & {
  source: StringLiteral<F>;
  exportKind?: "type" | "value"; // TODO: Not in spec
};

/*=======================================================*\
|                       CLASSES                           |
\*=======================================================*/

type Class<F extends _F> = ClassDeclaration<F> | ClassExpression<F>;

type PrivateName<F extends _F> = _N<"PrivateName"> & {
  id: Identifier<F>;
};

type ClassBase<F extends _F> = HasDecorators<F> & {
  id: Identifier<F>;
  superClass: Expression<F>;
  body: ClassBody<F>;
  decorators: $ReadOnlyArray<Decorator<F>>;
} & _Types<F, { typeParameters?: _TypeParameterDeclaration<F> }> &
  _Types<F, { superTypeParameters?: _TypeParameterInstantiation<F> }> &
  _Flow<F, { implements?: $ReadOnlyArray<FlowClassImplements<F>> }> &
  _TS<F, { implements?: $ReadOnlyArray<TsExpressionWithTypeArguments<F>> }>;

type ClassBody<F extends _F> = _N<"ClassBody"> & {
  type: "ClassBody";
  body: Array<ClassMember<F> | _TS<F, TsIndexSignature<F>, never>>; // TODO: $ReadOnlyArray
};
// | Placeholder<"ClassBody">;

type ClassMemberBase<F extends _F> = HasDecorators<F> & {
  static: boolean;
  computed: boolean;
} & _TS<F, { accessibility?: TSAccessibility }> &
  _TS<F, { abstract?: true }> &
  _TS<F, { optional?: true }>;

type ClassMember<F extends _F> =
  | ClassMethod<F>
  | ClassPrivateMethod<F>
  | ClassProperty<F>
  | ClassPrivateProperty<F>;

type MethodKind = "constructor" | "method" | "get" | "set";

type MethodBase<F extends _F> = FunctionBase<F> & {
  kind: MethodKind;
};

type ClassMethodOrDeclareMethodCommon<F extends _F> = ClassMemberBase<F> & {
  key: Expression<F>;
  kind: MethodKind;
  static: boolean;
  decorators: $ReadOnlyArray<Decorator<F>>;
};

type ClassMethod<F extends _F> = _N<"ClassMethod"> &
  MethodBase<F> &
  ClassMethodOrDeclareMethodCommon<F> &
  _Flow<F, { variance?: FlowVariance<F> }>;

type ClassPrivateMethod<F extends _F> = _N<"ClassPrivateMethod"> &
  ClassMethodOrDeclareMethodCommon<F> &
  MethodBase<F> & {
    key: PrivateName<F>;
    computed: false;
  };

type ClassProperty<F extends _F> = _N<"ClassProperty"> &
  ClassMemberBase<F> &
  DeclarationBase<F> & {
    type: "ClassProperty";
    key: Expression<F>;
    value: Expression<F> | null;

    typeAnnotation?: _TypeAnnotation<F>; // TODO: Not in spec
    variance?: FlowVariance<F> | null; // TODO: Not in spec

    // TypeScript only: (TODO: Not in spec)
    readonly?: true;
    definite?: true;
  };

type ClassPrivateProperty<F extends _F> = _N<"ClassPrivateProperty"> & {
  key: PrivateName<F>;
  value: Expression<F> | null;
  static: boolean;
  computed: false;
} & _Types<F, { typeAnnotation?: TypeAnnotationBase<F> }> &
  _TS<F, { optional?: true; definite?: true; readonly?: true }>;

type HasDecorators<F extends _F> = {
  decorators?: $ReadOnlyArray<Decorator<F>>;
};

type Decorator<F extends _F> = _N<"Decorator"> & {
  expression: Expression<F>;
  arguments?: Array<Expression<F> | SpreadElement<F>>;
};

/*=======================================================*\
|                      FUNCTIONS                          |
\*=======================================================*/

type Function<F extends _F> =
  | NormalFunction<F>
  | ArrowFunctionExpression<F>
  | ObjectMethod<F>
  | ClassMethod<F>;

type NormalFunction<F extends _F> =
  | FunctionDeclaration<F>
  | FunctionExpression<F>;

type BodilessFunctionOrMethodBase<F extends _F> = HasDecorators<F> & {
  // TODO: Remove this. Should not assign "id" to methods.
  // https://github.com/babel/babylon/issues/535
  id: Identifier<F> | void;

  params: $ReadOnlyArray<
    Pattern<F> | _If<F["TypeScript"], TSParameterProperty<F>>
  >;
  body: BlockStatement<F>;
  generator: boolean;
  async: boolean;

  // TODO: All not in spec
  expression: boolean;
} & _Types<
    F,
    {
      typeParameters?: _TypeParameterDeclaration<F> | void;
      returnType?: _TypeAnnotation<F> | void;
    }
  >;

type BodilessFunctionBase<F extends _F> = BodilessFunctionOrMethodBase<F> & {
  id: Identifier<F> | void;
};

type FunctionBase<F extends _F> = BodilessFunctionBase<F> & {
  body: BlockStatement<F>;
};

/*=======================================================*\
|                         FLOW                            |
\*=======================================================*/

type FlowTypeCastExpression<F extends _F> = _N<"TypeCastExpression"> & {
  expression: Expression<F>;
  typeAnnotation: FlowTypeAnnotation<F>;
};

type FlowInterfaceType<F extends _F> = _N<"InterfaceType"> & {
  extends: FlowInterfaceExtends<F>;
  body: FlowObjectTypeAnnotation<F>;
};

type FlowType<F extends _F> = _N<"Type">;
type FlowPredicate<F extends _F> = _N<"Predicate">;
type FlowDeclare<F extends _F> = _N<"Declare">;
type FlowDeclareClass<F extends _F> = _N<"DeclareClass">;
type FlowDeclareExportDeclaration<F extends _F> = _N<
  "DeclareExportDeclaration"
>;
type FlowDeclareFunction<F extends _F> = _N<"DeclareFunction">;
type FlowDeclareVariable<F extends _F> = _N<"DeclareVariable">;
type FlowDeclareModule<F extends _F> = _N<"DeclareModule">;
type FlowDeclareModuleExports<F extends _F> = _N<"DeclareModuleExports">;
type FlowDeclareTypeAlias<F extends _F> = _N<"DeclareTypeAlias">;
type FlowDeclareOpaqueType<F extends _F> = _N<"DeclareOpaqueType">;
type FlowDeclareInterface<F extends _F> = _N<"DeclareInterface">;
type FlowInterface<F extends _F> = _N<"Interface">;
type FlowInterfaceExtends<F extends _F> = _N<"InterfaceExtends">;
type FlowTypeAlias<F extends _F> = _N<"TypeAlias">;
type FlowOpaqueType<F extends _F> = _N<"OpaqueType">;
type FlowObjectTypeIndexer<F extends _F> = _N<"ObjectTypeIndexer">;
type FlowObjectTypeInternalSlot<F extends _F> = _N<"ObjectTypeInternalSlot">;
type FlowFunctionTypeAnnotation<F extends _F> = _N<"FunctionTypeAnnotation">;
type FlowObjectTypeProperty<F extends _F> = _N<"ObjectTypeProperty">;
type FlowObjectTypeSpreadProperty<F extends _F> = _N<
  "ObjectTypeSpreadProperty"
>;
type FlowObjectTypeCallProperty<F extends _F> = _N<"ObjectTypeCallProperty">;
type FlowObjectTypeAnnotation<F extends _F> = _N<"ObjectTypeAnnotation">;
type FlowQualifiedTypeIdentifier<F extends _F> = _N<"QualifiedTypeIdentifier">;
type FlowGenericTypeAnnotation<F extends _F> = _N<"GenericTypeAnnotation">;
type FlowTypeofTypeAnnotation<F extends _F> = _N<"TypeofTypeAnnotation">;
type FlowTupleTypeAnnotation<F extends _F> = _N<"TupleTypeAnnotation">;
type FlowFunctionTypeParam<F extends _F> = _N<"FunctionTypeParam">;
type FlowTypeAnnotation<F extends _F> = _N<"TypeAnnotation">;
type FlowVariance<F extends _F> = _N<"Variance">;
type FlowClassImplements<F extends _F> = _N<"ClassImplements">;

/*=======================================================*\
|                       ESTREE                            |
\*=======================================================*/

type EstreeLiteral<F extends _F> = _Assert<F["ESTree"]> &
  _N<"Literal"> & {
    raw: string;
    value: any;
  };

type EstreeProperty<F extends _F> = _Assert<F["ESTree"]> &
  _N<"Property"> & {
    shorthand: boolean;
    key: Expression<F>;
    computed: boolean;
    value: Expression<F>;
    decorators: $ReadOnlyArray<Decorator<F>>;
    kind?: "get" | "set" | "init";

    variance?: FlowVariance<F>;
  };

type EstreeMethodDefinition<F extends _F> = _Assert<F["ESTree"]> &
  _N<"MethodDefinition"> & {
    static: boolean;
    key: Expression<F>;
    computed: boolean;
    value: Expression<F>;
    decorators: $ReadOnlyArray<Decorator<F>>;
    kind?: "get" | "set" | "method";

    variance?: FlowVariance<F>;
  };

type EstreeImportExpression<F extends _F> = _Assert<F["ESTree"]> &
  _N<"ImportExpression"> & {
    source: Expression<F>;
  };

/*=======================================================*\
|                     TYPESCRIPT                          |
\*=======================================================*/

// Note: A type named `TsFoo` is based on TypeScript's `FooNode` type,
// defined in https://github.com/Microsoft/TypeScript/blob/master/src/compiler/types.ts
// Differences:
// * Change `NodeArray<T>` to just `$ReadOnlyArray<T>`.
// * Don't give nodes a "modifiers" list; use boolean flags instead,
//   and only allow modifiers that are not considered errors.
// * A property named `type` must be renamed to `typeAnnotation` to avoid conflict with the node's type.
// * Sometimes TypeScript allows to parse something which will be a grammar error later;
//   in @babel/parser these cause exceptions, so the AST format is stricter.

// ================
// Misc
// ================

type TSAccessibility = "public" | "protected" | "private";

type TSParameterProperty<F extends _F> = _N<"TSParameterProperty"> &
  HasDecorators<F> & {
    // Note: This has decorators instead of its parameter.
    // At least one of `accessibility` or `readonly` must be set.
    accessibility?: TSAccessibility;
    readonly?: true;
    parameter: Identifier<F> | AssignmentPattern<F>;
  };

type TSDeclareFunction<
  F extends _F,
  IsDefaultExport extends boolean = false
> = _N<"TSDeclareFunction"> &
  BodilessFunctionBase<F> &
  DeclarationBase<F> & {
    id: Identifier<F> | (IsDefaultExport extends true ? null : never);
  };

type TSDeclareMethod<F extends _F> = _N<"TSDeclareMethod"> &
  BodilessFunctionOrMethodBase<F> &
  ClassMethodOrDeclareMethodCommon<F> & {
    kind: MethodKind;
  };

type TsQualifiedName<F extends _F> = _N<"TSQualifiedName"> & {
  left: TsEntityName<F>;
  right: Identifier<F>;
};

type TsEntityName<F extends _F> = Identifier<F> | TsQualifiedName<F>;

type TsSignatureDeclaration<F extends _F> =
  | TsCallSignatureDeclaration<F>
  | TsConstructSignatureDeclaration<F>
  | TsMethodSignature<F>
  | TsFunctionType<F>
  | TsConstructorType<F>;

type TsSignatureDeclarationOrIndexSignatureBase<F extends _F> = {
  // Not using TypeScript's "ParameterDeclaration" here, since it's inconsistent with regular functions.
  parameters: $ReadOnlyArray<
    Identifier<F> | RestElement<F> | ObjectPattern<F> | ArrayPattern<F>
  >;
  typeAnnotation: TsTypeAnnotation<F> | null;
};

type TsSignatureDeclarationBase<
  F extends _F
> = TsSignatureDeclarationOrIndexSignatureBase<F> & {
  typeParameters: TsTypeParameterDeclaration<F> | null;
};

// ================
// TypeScript type members (for type literal / interface / class)
// ================

type TsTypeElement<F extends _F> =
  | TsCallSignatureDeclaration<F>
  | TsConstructSignatureDeclaration<F>
  | TsPropertySignature<F>
  | TsMethodSignature<F>
  | TsIndexSignature<F>;

type TsCallSignatureDeclaration<F extends _F> = _N<
  "TSCallSignatureDeclaration"
> &
  TsSignatureDeclarationBase<F>;

type TsConstructSignatureDeclaration<F extends _F> = _N<
  "TSConstructSignature"
> &
  TsSignatureDeclarationBase<F>;

type TsNamedTypeElementBase<F extends _F> = {
  // Not using TypeScript's `PropertyName` here since we don't have a `ComputedPropertyName` node type.
  // This is usually an Identifier but may be e.g. `Symbol.iterator` if `computed` is true.
  key: Expression<F>;
  computed: boolean;
  optional?: true;
};

type TsPropertySignature<F extends _F> = _N<"TSPropertySignature"> &
  TsNamedTypeElementBase<F> & {
    readonly?: true;
    typeAnnotation?: TsTypeAnnotation<F>;
    initializer?: Expression<F>;
  };

type TsMethodSignature<F extends _F> = _N<"TSMethodSignature"> &
  TsSignatureDeclarationBase<F> &
  TsNamedTypeElementBase<F>;

// *Not* a ClassMemberBase: Can't have accessibility, can't be abstract, can't be optional.
type TsIndexSignature<F extends _F> = _N<"TSIndexSignature"> &
  TsSignatureDeclarationOrIndexSignatureBase<F> & {
    readonly?: true;
    // Note: parameters.length must be 1.
  };

// ================
// TypeScript types
// ================

type TsType<F extends _F> =
  | TsKeywordType<F>
  | TsThisType<F>
  | TsFunctionOrConstructorType<F>
  | TsTypeReference<F>
  | TsTypeQuery<F>
  | TsTypeLiteral<F>
  | TsArrayType<F>
  | TsTupleType<F>
  | TsOptionalType<F>
  | TsRestType<F>
  | TsUnionOrIntersectionType<F>
  | TsConditionalType<F>
  | TsInferType<F>
  | TsParenthesizedType<F>
  | TsTypeOperator<F>
  | TsIndexedAccessType<F>
  | TsMappedType<F>
  | TsLiteralType<F>
  | TsImportType<F>
  // TODO: This probably shouldn't be included here.
  | TsTypePredicate<F>;

type TsKeywordTypeType =
  | "TSAnyKeyword"
  | "TSUnknownKeyword"
  | "TSNumberKeyword"
  | "TSObjectKeyword"
  | "TSBooleanKeyword"
  | "TSBigIntKeyword"
  | "TSStringKeyword"
  | "TSSymbolKeyword"
  | "TSVoidKeyword"
  | "TSUndefinedKeyword"
  | "TSNullKeyword"
  | "TSNeverKeyword";

type TsKeywordType<F extends _F> = _N<TsKeywordTypeType>;

type TsThisType<F extends _F> = _N<"TSThisType">;

type TsFunctionOrConstructorType<F extends _F> =
  | TsFunctionType<F>
  | TsConstructorType<F>;

type TsFunctionType<F extends _F> = _N<"TSFunctionType"> &
  TsSignatureDeclarationBase<F> & {
    typeAnnotation: TsTypeAnnotation<F>; // not optional
  };

type TsConstructorType<F extends _F> = _N<"TSConstructorType"> &
  TsSignatureDeclarationBase<F> & {
    typeAnnotation: TsTypeAnnotation<F>;
  };

type TsTypeReference<F extends _F> = _N<"TSTypeReference"> & {
  typeName: TsEntityName<F>;
  typeParameters?: TsTypeParameterInstantiation<F>;
};

type TsTypePredicate<F extends _F> = _N<"TSTypePredicate"> & {
  parameterName: Identifier<F> | TsThisType<F>;
  typeAnnotation: TsTypeAnnotation<F>;
  asserts?: boolean;
};

// `typeof` operator
type TsTypeQuery<F extends _F> = _N<"TSTypeQuery"> & {
  exprName: TsEntityName<F> | TsImportType<F>;
};

type TsTypeLiteral<F extends _F> = _N<"TSTypeLiteral"> & {
  members: $ReadOnlyArray<TsTypeElement<F>>;
};

type TsArrayType<F extends _F> = _N<"TSArrayType"> & {
  elementType: TsType<F>;
};

type TsTupleType<F extends _F> = _N<"TSTupleType"> & {
  elementTypes: $ReadOnlyArray<TsType<F>>;
};

type TsOptionalType<F extends _F> = _N<"TSOptionalType"> & {
  typeAnnotation: TsType<F>;
};

type TsRestType<F extends _F> = _N<"TSRestType"> & {
  typeAnnotation: TsType<F>;
};

type TsUnionOrIntersectionType<F extends _F> =
  | TsUnionType<F>
  | TsIntersectionType<F>;

type TsUnionOrIntersectionTypeBase<F extends _F> = {
  types: $ReadOnlyArray<TsType<F>>;
};

type TsUnionType<F extends _F> = _N<"TSUnionType"> &
  TsUnionOrIntersectionTypeBase<F>;

type TsIntersectionType<F extends _F> = _N<"TSIntersectionType"> &
  TsUnionOrIntersectionTypeBase<F>;

type TsConditionalType<F extends _F> = _N<"TSConditionalType"> & {
  checkType: TsType<F>;
  extendsType: TsType<F>;
  trueType: TsType<F>;
  falseType: TsType<F>;
};

type TsInferType<F extends _F> = _N<"TSInferType"> & {
  typeParameter: TsTypeParameter<F>;
};

type TsParenthesizedType<F extends _F> = _N<"TSParenthesizedType"> & {
  typeAnnotation: TsType<F>;
};

type TsTypeOperator<F extends _F> = _N<"TSTypeOperator"> & {
  operator: "keyof" | "unique" | "readonly";
  typeAnnotation: TsType<F>;
};

type TsIndexedAccessType<F extends _F> = _N<"TSIndexedAccessType"> & {
  objectType: TsType<F>;
  indexType: TsType<F>;
};

type TsMappedType<F extends _F> = _N<"TSMappedType"> & {
  readonly?: true | "+" | "-";
  typeParameter: TsTypeParameter<F>;
  optional?: true | "+" | "-";
  typeAnnotation: TsType<F> | null;
};

type TsLiteralType<F extends _F> = _N<"TSLiteralType"> & {
  literal:
    | NumericLiteral<F>
    | StringLiteral<F>
    | BooleanLiteral<F>
    | TemplateLiteral<F>;
};

type TsImportType<F extends _F> = _N<"TsImportType"> & {
  argument: StringLiteral<F>;
  qualifier?: TsEntityName<F>;
  typeParameters?: TsTypeParameterInstantiation<F>;
};

// ================
// TypeScript declarations
// ================

type TsInterfaceDeclaration<F extends _F> = _N<"TSInterfaceDeclaration"> &
  DeclarationBase<F> & {
    id: Identifier<F>;
    typeParameters: TsTypeParameterDeclaration<F> | null;
    // TS uses "heritageClauses", but want this to resemble ClassBase.
    extends?: $ReadOnlyArray<TsExpressionWithTypeArguments<F>>;
    body: TSInterfaceBody<F>;
  };

type TSInterfaceBody<F extends _F> = _N<"TSInterfaceBody"> & {
  body: $ReadOnlyArray<TsTypeElement<F>>;
};

type TsExpressionWithTypeArguments<F extends _F> = _N<
  "TSExpressionWithTypeArguments"
> & {
  expression: TsEntityName<F>;
  typeParameters?: TsTypeParameterInstantiation<F>;
};

type TsTypeAliasDeclaration<F extends _F> = _N<"TSTypeAliasDeclaration"> &
  DeclarationBase<F> & {
    id: Identifier<F>;
    typeParameters: TsTypeParameterDeclaration<F> | null;
    typeAnnotation: TsType<F>;
  };

type TsEnumDeclaration<F extends _F> = _N<"TSEnumDeclaration"> &
  DeclarationBase<F> & {
    const?: true;
    id: Identifier<F>;
    members: $ReadOnlyArray<TsEnumMember<F>>;
  };

type TsEnumMember<F extends _F> = _N<"TSEnumMemodulmber"> & {
  id: Identifier<F> | StringLiteral<F>;
  initializer?: Expression<F>;
};

type TsModuleDeclaration<F extends _F> = _N<"TSModuleDeclaration"> &
  DeclarationBase<F> & {
    global?: true; // In TypeScript, this is only available through `node.flags`.
    id: TsModuleName<F>;
    body: TsNamespaceBody<F>;
  };

// `namespace A.B { }` is a namespace named `A` with another TsNamespaceDeclaration as its body.
type TsNamespaceBody<F extends _F> =
  | TsModuleBlock<F>
  | TsNamespaceDeclaration<F>;

type TsModuleBlock<F extends _F> = _N<"TSModuleBlock"> & {
  body: $ReadOnlyArray<Statement<F>>;
};

type TsNamespaceDeclaration<F extends _F> = TsModuleDeclaration<F> & {
  id: Identifier<F>;
  body: TsNamespaceBody<F>;
};

type TsModuleName<F extends _F> = Identifier<F> | StringLiteral<F>;

type TsImportEqualsDeclaration<F extends _F> = _N<
  "TSImportEqualsDeclaration"
> & {
  isExport: boolean;
  id: Identifier<F>;
  moduleReference: TsModuleReference<F>;
};

type TsModuleReference<F extends _F> =
  | TsEntityName<F>
  | TsExternalModuleReference<F>;

type TsExternalModuleReference<F extends _F> = _N<
  "TSExternalModuleReference"
> & {
  expression: StringLiteral<F>;
};

// TypeScript's own parser uses ExportAssignment for both `export default` and `export =`.
// But for @babel/parser, `export default` is an ExportDefaultDeclaration,
// so a TsExportAssignment is always `export =`.
type TsExportAssignment<F extends _F> = _N<"TSExportAssignment"> & {
  expression: Expression<F>;
};

type TsNamespaceExportDeclaration<F extends _F> = _N<
  "TSNamespaceExportDeclaration"
> & {
  id: Identifier<F>;
};

// ================
// TypeScript expressions
// ================

type TsTypeAssertionLikeBase<F extends _F> = {
  expression: Expression<F>;
  typeAnnotation: TsType<F>;
};

type TsAsExpression<F extends _F> = _N<"TSAsExpression"> &
  TsTypeAssertionLikeBase<F>;

type TsTypeAssertion<F extends _F> = _N<"TSTypeAssertion"> &
  TsTypeAssertionLikeBase<F>;

type TsNonNullExpression<F extends _F> = _N<"TSNonNullExpression"> & {
  expression: Expression<F>;
};
