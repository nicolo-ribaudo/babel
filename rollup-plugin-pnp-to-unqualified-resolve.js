const path = require("path");
let pnp;

try {
  pnp = require("pnpapi");
} catch (error) {
  // not in PnP; not a problem
}

module.exports = options => ({
  name: "pnp-to-unqualified",
  resolveId: function(importee, importer) {
    if (!pnp || /\0/.test(importee) || !importer || path.isAbsolute(importee)) {
      return null;
    }

    const resolved = pnp.resolveToUnqualified(importee, importer, options);

    if (!resolved) {
      return null;
    }

    return this.resolve(resolved, importer);
  },
});
