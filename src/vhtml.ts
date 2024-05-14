// Derived from:
// https://github.com/developit/vhtml/blob/96fe21e63a983d7a8f52d8c51a0c994490313abc/src/vhtml.js
// License: MIT

const emptyTags = [
  "area",
  "base",
  "br",
  "col",
  "command",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
];

// escape an attribute
const map = {
  "&": "amp",
  "<": "lt",
  ">": "gt",
  '"': "quot",
  "'": "apos",
} as Record<string, string>;
const esc = (str: string) => str.replace(/[&<>"']/g, (s) => `&${map[s]};`);
const DOMAttributeNames = {
  className: "class",
  htmlFor: "for",
} as Record<string, string>;

export type VNode = { rawHtml: string };

export type VChild = VNode | string | null | undefined | false | VChild[];

export function h(
  name: string | null,
  attrs: Record<string, string | boolean | null | undefined> | null = null,
  ...childrenNestedArray: VChild[]
): VNode {
  let s = "";
  const children = childrenNestedArray.flat();

  if (name) {
    s += "<" + name;
    if (attrs)
      for (let i in attrs) {
        const attr = attrs[i];
        if (attr !== false && attr != null) {
          s += ` ${DOMAttributeNames[i] ? DOMAttributeNames[i] : esc(i)}="${esc(
            String(attr)
          )}"`;
        }
      }
    s += ">";
  }

  if (!name || emptyTags.indexOf(name) === -1) {
    for (const child of children) {
      if (child) {
        if (typeof child === "string") {
          s += esc(child);
        } else if (
          typeof child === "object" &&
          "rawHtml" in child &&
          typeof child.rawHtml === "string"
        ) {
          s += child.rawHtml;
        } else {
          throw new Error(`Invalid child: ${child}`);
        }
      }
    }

    s += name ? `</${name}>` : "";
  }

  return { rawHtml: s };
}

export const rawHtml = (html: string): VNode => ({ rawHtml: html });

export const fragmentHtml = (...children: VChild[]) =>
  h(null, null, ...children);
