import { Argument } from "@swc/core";

export function parseArgs(args: Argument[]): string[] {
  return args.reduce((acc, arg) => {
    if (arg.expression.type === "StringLiteral") {
      acc.push(arg.expression.value);
    }
    return acc;
  }, []);
}
