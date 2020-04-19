// TODO: Remove in Babel 8

export {
  default,
  isBrowsersQueryValid,
  // @ts-expect-error todo(flow->ts): semverMin is not actually exported
  semverMin,
} from "@babel/helper-compilation-targets";
