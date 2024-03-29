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
let setInnerHTMLAttr = "dangerouslySetInnerHTML";
let DOMAttributeNames = {
  className: "class",
  htmlFor: "for",
};

let sanitized = {};

/** Hyperscript reviver that constructs a sanitized HTML string. */
export function h(name, attrs) {
  let stack = [],
    s = "";
  attrs = attrs || {};
  for (let i = arguments.length; i-- > 2; ) {
    stack.push(arguments[i]);
  }

  if (name) {
    s += "<" + name;
    if (attrs)
      for (let i in attrs) {
        if (attrs[i] !== false && attrs[i] != null && i !== setInnerHTMLAttr) {
          s += ` ${DOMAttributeNames[i] ? DOMAttributeNames[i] : esc(i)}="${esc(attrs[i])}"`;
        }
      }
    s += ">";
  }

  if (emptyTags.indexOf(name) === -1) {
    if (attrs[setInnerHTMLAttr]) {
      s += attrs[setInnerHTMLAttr].__html;
    } else
      while (stack.length) {
        let child = stack.pop();
        if (child) {
          if (child.pop) {
            for (let i = child.length; i--; ) stack.push(child[i]);
          } else {
            s += sanitized[child] === true ? child : esc(child);
          }
        }
      }

    s += name ? `</${name}>` : "";
  }

  sanitized[s] = true;
  return s;
}
