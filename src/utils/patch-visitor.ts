import Visitor from "@swc/core/Visitor";
import { Collector } from "./collector";
import { MemberExpression } from "@swc/types";
import { Selector } from "../enums/selector";
import purgecssFromHtml from "purgecss-from-html";
import { parseArgs } from "./parse-args";

/**
 * In sake of simplifying there we are considering only StringLiteral assignments
 */
export function patchVisitor(visitor: Visitor, collector: Collector): void {
  visitor.visitTsType = (n) => n;

  /**
   * Covered cases:
   * 1) el.className = 'value1'
   * 2) el.className += ' value2 value4'
   * 3) el.id = 'value3'
   * 4) el.innerHtml = 'value5' || el.outerHtml = 'value6'
   **/
  visitor.visitAssignmentExpression = (stmt) => {
    if (stmt.operator === "=" || stmt.operator === "+=") {
      if ((stmt.left.type = "MemberExpression")) {
        const leftMemberExpr = stmt.left as MemberExpression;
        const rightMemberExpr = stmt.right;

        /** className = 'value' || className += 'value' || id = 'value' */
        if (
          leftMemberExpr.property.type === "Identifier" &&
          rightMemberExpr.type === "StringLiteral" &&
          (leftMemberExpr.property.value === Selector.ClassName ||
            leftMemberExpr.property.value === Selector.Id)
        ) {
          collector.addFromAssignment(
            leftMemberExpr.property.value,
            rightMemberExpr.value
          );
        }

        /** innerHtml = 'value3' || outerHtml = 'value4' */
        if (
          leftMemberExpr.property.type === "Identifier" &&
          rightMemberExpr.type === "StringLiteral" &&
          (leftMemberExpr.property.value === Selector.InnerHtml ||
            leftMemberExpr.property.value === Selector.OuterHtml)
        ) {
          collector.mergeHtmlExtraction(purgecssFromHtml(rightMemberExpr.value));
        }
      }
    }
    return stmt;
  };

  /**
   * Covered cases:
   * 1) el.classList.add('value', 'value2')
   * 2) el.setAttribute('name', 'value')
   **/
  visitor.visitCallExpression = (n) => {
    if (n.callee.type === "MemberExpression") {
      const thisObj = n.callee.object;

      /** classList.add */
      if (
        thisObj.type === "MemberExpression" &&
        thisObj.property.type === "Identifier" &&
        thisObj.property.value === "classList" &&
        n.callee.property.type === "Identifier" &&
        n.callee.property.value === "add"
      ) {
        collector.addClassList(parseArgs(n.arguments));
      }

      /** setAttribute('key', 'value') */
      if (
        thisObj.type === "MemberExpression" &&
        n.callee.property.type === "Identifier" &&
        n.callee.property.value === "setAttribute"
      ) {
        collector.addAttribute(parseArgs(n.arguments));
      }
    }
    return n;
  };
}