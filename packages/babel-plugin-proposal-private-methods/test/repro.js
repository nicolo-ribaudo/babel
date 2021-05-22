import * as babel from "@babel/core";

describe("jest/node error", () => {
  it("test", async () => {
    await Promise.all([
      import("../../babel-plugin-proposal-class-properties/lib/index.js"),
      import("../../babel-plugin-proposal-private-methods/lib/index.js"),
    ]);
  });
});
