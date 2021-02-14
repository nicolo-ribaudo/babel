/* eslint-disable @babel/development/plugin-name */
import { createRegExpFeaturePlugin } from "@babel/helper-create-regexp-features-plugin";
import { declare } from "@babel/helper-plugin-utils";

export default declare(() =>
  createRegExpFeaturePlugin({
    name: "internal:transform-unicode-regex",
    feature: "unicodeFlag",
  }),
);
