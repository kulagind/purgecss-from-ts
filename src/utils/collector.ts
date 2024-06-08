import { ExtractorResultDetailed } from "purgecss";
import { Selector } from "../enums/selector";

export class Collector {
  private readonly ids = new Set<string>();
  private readonly classNames = new Set<string>();

  private readonly attributes: { names: Set<string>; values: Set<string> } = {
    names: new Set(),
    values: new Set(),
  };
  /** For extracting from innerHtml and outerHtml */
  private tags = new Set<string>();
  private undetermined = new Set<string>();

  /**
   * prop: 'className' | 'id'
   */
  addFromAssignment(prop: string, value: string): void {
    const targetCollection = this.getTargetAssignmentCollection(prop);
    if (!targetCollection) {
      return;
    }
    value
      .split(" ")
      .filter(Boolean)
      .forEach((v) => {
        targetCollection.add(v);
      });
  }

  addClassList(value: string | string[]): void {
    const normalizedValue = Array.isArray(value) ? value : [value];
    normalizedValue.forEach((v) => {
      this.classNames.add(v);
    });
  }

  addAttribute(attr: string[]): void {
    if (attr.length > 2 || attr.length < 1) {
      return;
    }
    this.attributes.names.add(attr[0]);
    if (attr[1]) {
      this.attributes.values.add(attr[1]);
    }
  }

  mergeHtmlExtraction(selectors: ExtractorResultDetailed): void {
    selectors.attributes.names.forEach((n) => {
      this.attributes.names.add(n);
    });
    selectors.attributes.values.forEach((v) => {
      this.attributes.values.add(v);
    });
    selectors.tags.forEach((v) => {
      this.tags.add(v);
    });
    selectors.classes.forEach((v) => {
      this.classNames.add(v);
    });
    selectors.undetermined.forEach((v) => {
      this.undetermined.add(v);
    });
  }

  get result(): ExtractorResultDetailed {
    return {
      attributes: {
        names: Array.from(this.attributes.names),
        values: Array.from(this.attributes.values),
      },
      ids: Array.from(this.ids),
      classes: Array.from(this.classNames),
      tags: Array.from(this.tags),
      undetermined: Array.from(this.undetermined),
    };
  }

  private getTargetAssignmentCollection(prop: string): Set<string> | null {
    switch (prop) {
      case Selector.ClassName:
        return this.classNames;
      case Selector.Id:
        return this.ids;
      default:
        return null;
    }
  }
}
