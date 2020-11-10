// Targets
export type Target =
  | "node"
  | "chrome"
  | "opera"
  | "edge"
  | "firefox"
  | "safari"
  | "ie"
  | "ios"
  | "android"
  | "electron"
  | "samsung";

export type Targets = {
  [target in Target]: string;
};

export type TargetsTuple = {
  [target in Target]: string;
};

export type Browsers = string | Array<string>;

export type InputTargets = {
  browsers?: Browsers;
  esmodules?: boolean;
} & Targets;
