import { declare } from "@babel/helper-plugin-utils";

export default declare(api => {
  api.assertVersion(REQUIRED_VERSION(7));

  return {
    name: "syntax-jsx",

    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("jsx");
    },
  };
});
