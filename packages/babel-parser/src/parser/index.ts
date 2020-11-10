import type { Options } from "../options";
import type { File /*::, JSXOpeningElement */ } from "../types";
import type { PluginList } from "../plugin-utils";
import { getOptions } from "../options";
import StatementParser from "./statement";
import { SCOPE_PROGRAM } from "../util/scopeflags";
import ScopeHandler from "../util/scope";
import ClassScopeHandler from "../util/class-scope";
import ExpressionScopeHandler from "../util/expression-scope";
import ProductionParameterHandler, {
  PARAM_AWAIT,
  PARAM,
} from "../util/production-parameter";

export type PluginsMap = Map<
  string,
  {
    [x: string]: any;
  }
>;

export default class Parser extends StatementParser {
  // Forward-declaration so typescript plugin can override jsx plugin
  /*::
  +jsxParseOpeningElementAfterName: (
    node: JSXOpeningElement,
  ) => JSXOpeningElement;
  */

  constructor(options: Options | undefined | null, input: string) {
    options = getOptions(options);
    super(options, input);

    const ScopeHandler = this.getScopeHandler();

    this.options = options;
    this.inModule = this.options.sourceType === "module";
    this.scope = new ScopeHandler(this.raise.bind(this), this.inModule);
    this.prodParam = new ProductionParameterHandler();
    this.classScope = new ClassScopeHandler(this.raise.bind(this));
    this.expressionScope = new ExpressionScopeHandler(this.raise.bind(this));
    this.plugins = pluginsMap(this.options.plugins);
    this.filename = options.sourceFilename;
  }

  // This can be overwritten, for example, by the TypeScript plugin.
  getScopeHandler(): {
    new (...args: any): ScopeHandler<any>;
  } {
    return ScopeHandler;
  }

  parse(): File {
    let paramFlags = PARAM;
    if (this.hasPlugin("topLevelAwait") && this.inModule) {
      paramFlags |= PARAM_AWAIT;
    }
    this.scope.enter(SCOPE_PROGRAM);
    this.prodParam.enter(paramFlags);
    const file = this.startNode();
    const program = this.startNode();
    this.nextToken();
    file.errors = null;
    this.parseTopLevel(file, program);
    file.errors = this.state.errors;
    return file;
  }
}

function pluginsMap(plugins: PluginList): PluginsMap {
  const pluginMap: PluginsMap = new Map();
  for (const plugin of plugins) {
    const [name, options] = Array.isArray(plugin) ? plugin : [plugin, {}];
    if (!pluginMap.has(name)) pluginMap.set(name, options || {});
  }
  return pluginMap;
}
