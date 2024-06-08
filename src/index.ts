import { parseSync } from "@swc/core";
import Visitor from "@swc/core/Visitor";
import { Collector } from "./utils/collector";
import { patchVisitor } from "./utils/patch-visitor";

function purgecssFromTs(content: string) {
  const { body } = parseSync(content, { syntax: "typescript" });
  const collector = new Collector();
  const visitor = new Visitor();
  patchVisitor(visitor, collector);
  visitor.visitModuleItems(body);
  return collector.result;
}

export default purgecssFromTs;
