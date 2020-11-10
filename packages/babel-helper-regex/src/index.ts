import pull from "lodash/pull";

export function is(node: any, flag: string): boolean {
  return node.type === "RegExpLiteral" && node.flags.indexOf(flag) >= 0;
}

export function pullFlag(node: any, flag: string) {
  const flags = node.flags.split("");
  if (node.flags.indexOf(flag) < 0) return;
  pull(flags, flag);
  node.flags = flags.join("");
}
