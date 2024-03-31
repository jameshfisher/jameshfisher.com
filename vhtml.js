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
let esc = (str) => String(str).replace(/[&<>"']/g, (s) => `&${map[s]};`);
let map = { "&": "amp", "<": "lt", ">": "gt", '"': "quot", "'": "apos" };
let DOMAttributeNames = {
  className: "class",
  htmlFor: "for",
};

/** Hyperscript reviver that constructs a fake element. To serialize, use the .rawHtml property */
export function h(name, attrs, ...childrenNestedArray) {
  let s = "";
  const children = childrenNestedArray.flat();

  if (name) {
    s += "<" + name;
    if (attrs)
      for (let i in attrs) {
        if (attrs[i] !== false && attrs[i] != null) {
          s += ` ${DOMAttributeNames[i] ? DOMAttributeNames[i] : esc(i)}="${esc(attrs[i])}"`;
        }
      }
    s += ">";
  }

  if (emptyTags.indexOf(name) === -1) {
    for (const child of children) {
      if (child) {
        s += typeof child.rawHtml === "string" ? child.rawHtml : esc(child);
      }
    }

    s += name ? `</${name}>` : "";
  }

  return { rawHtml: s };
}
