import testRunner from "@babel/helper-transform-fixture-test-runner";
import path from "path";

export default function run(name) {
  const loc = path.resolve(__dirname, "..", "fixtures", name);
  testRunner(loc, name);
}
