const pfs = require("fs").promises;
const os = require("os");
const path = require("path");
const { loadOptionsAsync } = require("../lib");

function fixture(...args) {
  return path.join(__dirname, "fixtures", "config", ...args);
}

async function getTemp(name) {
  const cwd = await pfs.mkdtemp(os.tmpdir() + path.sep + name);
  const tmp = name => path.join(cwd, name);
  const config = name =>
    pfs.copyFile(fixture("config-files-templates", name), tmp(name));
  return { cwd, tmp, config };
}

describe("segfault", () => {
  test("should load %s asynchronously", async () => {
    const name = "babel.config.js";

    const { cwd, tmp, config } = await getTemp(
      `babel-test-load-config-async-${name}`,
    );
    const filename = tmp("src.js");

    await config(name);

    await loadOptionsAsync({ filename, cwd });

    console.log("So far so good");

    // This is just needed to let Node.js flush the "So far so good" message
    await new Promise(resolve => setTimeout(resolve, 100));

    debugger;

    console.log(await import(`file://${__dirname}/fixtures/example.mjs`));
  });
});
