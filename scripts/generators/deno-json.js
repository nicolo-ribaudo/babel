import { glob } from "glob";
import { repoRoot } from "$repo-utils";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const packages = glob
  .sync("./packages/*", {
    cwd: repoRoot,
    absolute: true,
  })
  .filter(packageDir => {
    return existsSync(path.join(packageDir, "package.json"));
  });

const allPackages = [];
const babelVersion = `0.0.13-${
  JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8"))
    .version_babel8
}`;

for (const packageDir of packages) {
  if (
    packageDir.includes("babel-runtime-corejs2") ||
    packageDir.includes("babel-cli") ||
    packageDir.includes("babel-node") ||
    packageDir.includes("babel-register")
  ) {
    continue;
  }

  const packageJson = JSON.parse(
    readFileSync(path.join(packageDir, "package.json"), "utf8")
  );

  if (packageJson.private) {
    continue;
  }

  allPackages.push(packageDir);

  const imports = {};
  takeDeps(imports, packageJson.dependencies);
  takeDeps(imports, packageJson.peerDependencies);

  const denoJson = {
    name: jsrify(packageJson.name),
    version: babelVersion,
    exports: objectMap(packageJson.exports, (values, key) => {
      if (!Array.isArray(values)) values = [values];
      for (let value of values) {
        if (typeof value === "object") {
          value = value.default;
        }
        if (typeof value === "string") {
          if (value === "./regenerator/*.js") return undefined;
          if (value === "./regenerator/") return undefined;
          if (value === "./core-js/*.js") return undefined;
          if (value === "./core-js/") return undefined;
          if (value === "./core-js-stable/*.js") return undefined;
          if (value === "./core-js-stable/") return undefined;
          if (value.startsWith("./lib")) {
            return value.replace(/\.([mc]?)js$/, ".$1ts");
          }
          return value;
        }
      }
      throw new Error(`Unexpected exports value for ${key} in ${packageDir}`);
    }),
    imports,
    publish: {
      exclude: [
        "test/",
        "!lib/",
        packageDir.includes("babel-runtime") ? "!helpers/" : null,
        packageDir.includes("babel-runtime") ? "!core-js/" : null,
        packageDir.includes("babel-runtime") ? "!core-js-stable/" : null,
        packageDir.includes("babel-standalone") ? "!babel.js/" : null,
        packageDir.includes("babel-standalone") ? "!babel.min.js/" : null,
      ].filter(Boolean),
    },
  };

  writeFileSync(
    path.join(packageDir, "deno.json"),
    JSON.stringify(denoJson, null, 2) + "\n"
  );
}

writeFileSync(
  path.join(repoRoot, "deno.json"),
  JSON.stringify({ workspace: allPackages }, null, 2) + "\n"
);

function objectMap(obj, cb) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, cb(v, k)]));
}

function jsrify(npmName) {
  // prettier-ignore
  const [/* scope */ , name] = npmName.split("/");
  return `@babel-test-6ae45912/${name.slice(0, 58)}`;
}

function takeDeps(imports, dependencies) {
  if (!dependencies) return;

  // eslint-disable-next-line prefer-const
  for (let [name, version] of Object.entries(dependencies)) {
    if (version.startsWith("condition:")) {
      const match =
        /condition:\s*\w+\s*\?\s*(?:(?<ifTrue>[\w.^~*]+)\s*)?:\s*(?:[\w.^~*]+\s*)?/.exec(
          version
        );
      if (!match) {
        throw new Error(`Invalid condition: ${version}`);
      }
      if (!match.groups.ifTrue) continue;
      version = match.groups.ifTrue;
    }
    if (version.startsWith("workspace:")) {
      imports[name] = `jsr:${jsrify(name)}@${babelVersion}`;
    } else {
      imports[name] = `npm:${name}@${version}`;
    }
  }
}
